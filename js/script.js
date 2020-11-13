Promise.all([ // load multiple files
	d3.json('./data/airports.json'),
	d3.json('./data/worldmap.json')
]).then(([airports, topoMap])=>{

    const geoMap = topojson.feature(topoMap, topoMap.objects.countries).features;
    console.log("airports=", airports);
    console.log("geoMap=", geoMap);

    const margin = {top: 20, right: 20, bottom: 20, left: 20};
    const width = 720 - margin.left - margin.right,
        height = 360 - margin.top - margin.bottom;

    const projection = d3.geoMercator()
                            .fitExtent([[0,0], [width,height]], topojson.feature(topoMap, topoMap.objects.countries));

    const path = d3.geoPath()
                    .projection(projection);
    
    // const color = d3.scaleSequential(d3.interpolateBlues)
    //                 .domain(d3.extent(topoMap, d=>positive));

    const svg = d3.select('.nodeGram')
                    .append('svg')
                    .attr("viewBox", [0,0,width,height]);
    
    const circleScale = d3.scaleLinear()
                        .domain(d3.extent(airports.nodes, d=>d.passengers))
                        .range([3,9]);

    const force = d3.forceSimulation(airports.nodes)
                    .force("charge", d3.forceManyBody().strength(-15))
                    .force("center", d3.forceCenter(width/2, height/2))
                    .force("link", d3.forceLink(airports.links).distance(50))
                    .force("collide", d3.forceCollide().radius(d=>circleScale(d.passengers)));
                    
    const links = svg
                    .attr("stroke", "black")
                    .attr("stroke-opacity", 0.6)
                    .selectAll("line")
                    .data(airports.links)
                    .join("line")
                    .attr("stroke-width", 1)
                    .attr("stroke", "black");

    // svg.append("g")
    //     .attr("transform", "translate(0,0)")
    //     .append(
    //         () => legend({color, title: data.title, width: 260})
    //     );
    
    svg.append("g")
        .selectAll('path')
        .data(geoMap)
        .join("path")
        .attr("d", path)
        // .attr("fill", d => color(data.get(d.id)))
        .append("title")
        // .text(d => `${d.properties.name}, 
        //             ${states.get(d.id.slice(0, 2)).name}
        //             ${format(data.get(d.id))}`
        // );
    
    svg.append("path")
        .datum(topojson.mesh(topoMap, topoMap.objects.countries, (a, b) => a !== b))
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-linejoin', 'round')
        // .attr("class", "subunit-boundary")
        .attr("d", path);
   
    drag = simulation => {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
    }

    nodes = svg.selectAll("circle")
                        .data(airports.nodes)
                        .join("circle")
                        .attr("fill", "salmon")
                        .attr("r", d=>circleScale(d.passengers))
                        .call(drag(force));
    
    // nodes.append("title").text(d => d.name);

    force.on("tick", ()=>{
        nodes
            .attr("cx", d=>{return d.x;})
            .attr("cy", d=>{return d.y;});
        links
            .attr("x1", d=>{return d.source.x;})
            .attr("y1", d=>{return d.source.y;})
            .attr("x2", d=>{return d.target.x;})
            .attr("y2", d=>{return d.target.y;});
    });

    d3.selectAll(".button").on("change", event=>{
        visType = event.target.value; // selected button
        switchLayout();
    });

    function switchLayout() {
        if (visType === "map") { // Map layout
            console.log("viewing Map...");
            // stop the simulation
            // drag.dragstarted.filter(event => visType === "force");

            // set the positions of links and nodes based on geo-coordinates
            nodes = svg.selectAll("circle")
                                .data(airports.nodes)
                                .join("circle")
                                .attr("fill", "salmon")
                                .attr("r", d=>circleScale(d.passengers));

            nodes.append("title").text(d => d.name);

            force.on("tick", ()=>{
                nodes
                    .transition()
                    .duration(50)
                    .attr("cx", d=>projection([d.longitude, d.latitude])[0])
                    .attr("cy", d=>projection([d.longitude, d.latitude])[1]);
                links
                    .transition()
                    .duration(50)
                    .attr('opacity', 0)
                    .attr("x1", d=>{return d.source.x;})
                    .attr("y1", d=>{return d.source.y;})
                    .attr("x2", d=>{return d.target.x;})
                    .attr("y2", d=>{return d.target.y;});
            });
            // set the map opacity to 1
            svg.selectAll('path')
                .transition()
                .duration(500)
                .attr('opacity', 1);
            
        } else { // Force layout
            console.log("viewing Force...");
            // restart the simulation
            // set the map opacity to 0
            svg.selectAll('path')
                .transition()
                .duration(500)
                .attr('opacity', 0);
            
            nodes = svg.selectAll("circle")
                        .data(airports.nodes)
                        .join("circle")
                        .attr("fill", "salmon")
                        .attr("r", d=>circleScale(d.passengers))
                        .call(drag(force));
            
            force.on("tick", ()=>{
                nodes
                    .transition()
                    .duration(50)
                    .attr("cx", d=>{return d.x;})
                    .attr("cy", d=>{return d.y;});
                links
                    .transition()
                    .duration(50)
                    .attr('opacity', 1)
                    .attr("x1", d=>{return d.source.x;})
                    .attr("y1", d=>{return d.source.y;})
                    .attr("x2", d=>{return d.target.x;})
                    .attr("y2", d=>{return d.target.y;});
            });
        }
    }

})