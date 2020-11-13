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
        // .call(g => g.select(".domain").remove())
        // .call(g => g.selectAll(".tick line").clone()
        //     .attr("y2", -height)
        //     .attr("stroke-opacity", 0.1))
        // .call(g => g.append("text")
        //     .attr("x", width - 4)
        //     .attr("y", -4)
        //     .attr("font-weight", "bold")
        //     .attr("text-anchor", "end")
        //     .attr("fill", "black")
        //     .text(driving.miles)
        //     .call(halo)
        // );
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(null, "$.2f"))
        // .call(g => g.select(".domain").remove())
        // .call(g => g.selectAll(".tick line").clone()
        //     .attr("x2", width)
        //     .attr("stroke-opacity", 0.1))
        // .call(g => g.select(".tick:last-of-type text").clone()
        //     .attr("x", 4)
        //     .attr("text-anchor", "start")
        //     .attr("font-weight", "bold")
        //     .attr("fill", "black")
        //     .text(driving.gas)
        //     .call(halo)
        // );
    
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
})