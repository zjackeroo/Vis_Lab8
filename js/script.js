Promise.all([ // load multiple files
	d3.csv('./data/driving.csv')
]).then(([driving])=>{

    console.log("driving=", driving);

    const margin = {top: 30, right: 50, bottom: 30, left: 50};
    const width = 720 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;
    
    const svg = d3.select('.nodeGram')
        .append('svg')
        .attr("viewBox", [0,0,width,height]);
    
    const xScale = d3.scaleLinear()
        .domain([3500,10500])
        // .domain(d3.extent(driving, d=>d.miles)).nice()
        .range([margin.left, width-margin.left]);
    const yScale = d3.scaleLinear()
        .domain(d3.extent(driving, d=>d.gas)).nice()
        .range([height-margin.bottom, margin.top]);

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(width / 80))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", -height)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", width - 4)
            .attr("y", -4)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .text("Mileage")
            .call(halo)
        );
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(null, "$.2f"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1))
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text("Cost per gallon")
            .call(halo)
        );
    
    svg.append("g")
        .call(xAxis);
    svg.append("g")
        .call(yAxis);

    svg.append("g")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
      .selectAll("circle")
      .data(driving)
      .join("circle")
        .attr("cx", d => xScale(d.miles))
        .attr("cy", d => yScale(d.gas))
        .attr("r", 3);

    const label = svg.selectAll("text")
        .data(driving)
        .join("g")
        .append("text")
        .text(d=>d.year)
        .attr("font-size", 10)
        .attr("x", d=>xScale(d.miles))
        .attr("y", d=>yScale(d.gas))
        .each(position)
        .call(halo);  

    const line = d3.line()
        .curve(d3.curveCatmullRom)
        .x(d => xScale(d.miles))
        .y(d => yScale(d.gas));
    const l = length(line(driving));
    svg.append("path")
        .datum(driving)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `0,${l}`)
        .attr("d", line)
        .transition()
        .duration(3000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l},${l}`);
})

function position(d) {
    const t = d3.select(this);
    switch (d.side) {
        case "top":
        t.attr("text-anchor", "middle").attr("dy", "-0.7em");
        break;
        case "right":
        t.attr("dx", "0.5em")
            .attr("dy", "0.32em")
            .attr("text-anchor", "start");
        break;
        case "bottom":
        t.attr("text-anchor", "middle").attr("dy", "1.4em");
        break;
        case "left":
        t.attr("dx", "-0.5em")
            .attr("dy", "0.32em")
            .attr("text-anchor", "end");
        break;
    }
}

function halo(text) {
    text
        .select(function() {
            return this.parentNode.insertBefore(this.cloneNode(true), this);
        })
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round");
}

function length(path) {
    return d3.create("svg:path").attr("d", path).node().getTotalLength();
}