// from https://observablehq.com/@enjalot/weird-sankey-links
function sankeyLinkPath(link) {
    // this is a drop in replacement for d3.sankeyLinkHorizontal()
    // well, without the accessors/options
    let offset = 0
    let sx = link.source.x1
    let tx = link.target.x0 + 1
    let sy0 = link.y0 - link.width/2
    let sy1 = link.y0 + link.width/2
    let ty0 = link.y1 - link.width/2
    let ty1 = link.y1 + link.width/2
    
    let halfx = (tx - sx)/2
  
    let path = d3.path()  
    path.moveTo(sx, sy0)
  
    let cpx1 = sx + halfx
    let cpy1 = sy0 + offset
    let cpx2 = sx + halfx
    let cpy2 = ty0 - offset
    path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty0)
    path.lineTo(tx, ty1)
  
    cpx1 = sx + halfx
    cpy1 = ty1 - offset
    cpx2 = sx + halfx
    cpy2 = sy1 + offset
    path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, sx, sy1)
    path.lineTo(sx, sy0)
    return path.toString()
}

let prevYear= 0

async function drawChart(){
    const dataset = await d3.json("./data.json")
        
    // 2. SET DIMENSIONS
    const dimensions = {
        width: 550,
        height: 100,
        margin: {
            top: 10,
            right: 100,
            bottom: 10,
            left: 100,
        }
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left 
        - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top
        - dimensions.margin.bottom

    // 3. DRAW CANVAS
    const wrapper = d3.select("#my_dataviz")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("id", "sankey_svg")
        .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
    const svg = document.getElementById("sankey_svg")
    const rc = rough.svg(svg)
    const bounds = wrapper.append("g")
        .attr("id", "sankey_bounds")
        .style("transform", `translate(${dimensions.margin.left}px,
            ${dimensions.margin.top}px)`)

    // 4. SET SANKEY PROPS

    const sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(10)
        .size([dimensions.boundedWidth, dimensions.boundedHeight]);
    
    // 5. DRAW DATA
    const drawData = function(year) {
        // 1. ACCESS DATA
        const nodes = d => d.nodes
        const links = year => ( d => d.links[year])

        sankey
        .nodes(nodes(dataset))
        .links(links(year)(dataset))
        
        sankey()
        // add in the links
        //bounds.selectAll(".link")
        //        .remove("title")
        
        if (year !== prevYear){
            console.log(year, prevYear)
            var link = bounds
                .selectAll(".link")
                //.data(links(year)(dataset))
                //.join("path")
                //  .attr("class", "link")
                //.attr("d", sankeyLinkPath)
                //.style("stroke-width", 1)
                //.sort(function(a, b) { return b.dy - a.dy; })
                //.append("title").text( d => (d.value * 100).toFixed(2) + "%")
                //.exit()
                .remove() 


            links(year)(dataset).forEach(d => {
                var node = rc.path(sankeyLinkPath(d),{
                    stroke: "#000000", 
                    strokeWidth:0.5, 
                    fill: "#F3C969",
                    fillStyle:"solid",
                    fillWeight: 1});
                node.classList.add("link")
                var titleNode = document.createElementNS("http://www.w3.org/2000/svg", "svg:title")
                titleNode.innerHTML = (d.value * 100).toFixed(2) + "%"
                node.append(titleNode)
                svg.getElementById("sankey_bounds").appendChild(node);
            })
        }
        
        const scaleDrawing = function(d){
            const scaleFactor = d3.min([(d.x1-d.x0 )/ d.drawing_width, (d.y1 - d.y0)/d.drawing_height])
            let translation = ""
            if((d.x1 - d.x0) / d.drawing_width > (d.y1 - d.y0)/d.drawing_height){
                translation = `translate(${( (d.x1 - d.x0)  - (d.drawing_width*scaleFactor) )/2}, 0)`
            }else {
                translation = `translate( 0, ${( (d.y1 - d.y0)  - (d.drawing_height*scaleFactor) )/2})`
            }

            return `${translation} translate(${d.x0}, ${d.y0}) scale(${scaleFactor}) `
        }

        // add the rectangles for the nodes
        bounds.selectAll(".node").remove()
            
        nodes(dataset).forEach(d => {
            var node = rc.path(d.drawing,{
                stroke: "#000000", 
                strokeWidth:d.stroke_width, 
                fill: d.fill,
                fillStyle: d.name === "Abfall Total"? "solid" : "zigzag",
                hachureGap: 3*d.stroke_width,
                fillWeight: 2*d.stroke_width});
            node.classList.add("node")
            node.setAttribute("transform", scaleDrawing(d))
            svg.getElementById("sankey_bounds").appendChild(node);
        })
        
        const bag_path = "m42.025 3085.5c-22.078-11.977-20.193-29.66 9.2574-86.846 44.789-86.97 131.3-173.52 212.47-212.58 53.96-25.966 77.409-31.458 118.27-27.702l34.04 3.1289-3.2333-13.716c-6.3403-26.896-22.099-148.55-27.326-210.94-6.7219-80.247-6.8529-316.2-0.22604-407.26 15.894-218.41 53.763-406.2 126.89-629.26 79.65-242.94 162.48-412.27 306.75-627.08 166.31-247.63 300.73-387.22 427.16-443.6 59.009-26.31 62.67-28.642 67.78-43.172 7.1207-20.248-6.5907-29.78-61.625-42.844-113.46-26.933-243.19-94.014-320.83-165.89-28.199-26.108-56.337-68.294-49.866-74.765 1.7042-1.7042 130.96-5.0571 287.23-7.4509 284.3-4.3549 356.12-8.5613 462.5-27.091 50.04-8.7152 108.31-23.771 134.74-34.816 26.785-11.191 28.016-9.4292 13.041 18.663-25.49 47.818-130.31 144.58-219.63 202.74-36.375 23.686-113.76 66.381-146.78 80.985-23.632 10.451-26.641 13.451-26.641 26.565 0 21.499 10.119 28.501 46.59 32.237 144.53 14.807 282.71 123.51 402.49 316.61 97.286 156.84 256.49 565.91 326.31 838.45 42.443 165.66 57.008 287.36 56.933 475.66-0.044 112.67-2.9424 165.07-19.945 360.73-4.2676 49.109-4.1585 65.074 0.4831 70.667 3.7155 4.4768 8.102 5.5489 11.532 2.8186 12.916-10.28 70.721-15.463 119.76-10.739 77.809 7.4953 135.86 31.164 249.95 101.91 89.806 55.686 109.01 82.377 109.01 151.54 0 35.318-2.0561 46.182-12.833 67.809-25.096 50.361-104.64 102.24-195.95 127.81-55.872 15.643-165.76 21.092-256.96 12.741-62.055-5.682-165.29-33.287-189.32-50.621-19.256-13.893-29.774-12.701-27.807 3.1531 1.4719 11.861-1.6152 14.138-40.522 29.882-100.35 40.607-297.61 97.538-434.25 125.33-79.967 16.264-195.9 33.83-281.72 42.687-95.583 9.8647-299.59 11.357-388.95 2.8456-95.561-9.1015-262.46-29.584-267.76-32.86-2.6122-1.6144-4.7494-7.263-4.7494-12.552 0-7.9532-3.5087-9.6171-20.28-9.6171-37.052 0-118.06 19.78-192.76 47.065-91.865 33.556-113.93 37.131-227.94 36.931-71.63-0.1258-94.642-1.7765-105.29-7.553z"
        
        wrapper.selectAll(".total_bag").remove() 
        
        dataset.bags_total[year].forEach(d => {const node = rc.path(bag_path, {
            stroke: "#000000", 
            strokeWidth:54, 
            fill: "#96bdc6",
            fillStyle:"zigzag",
            fillWeight: 150});
            node.classList.add("total_bag")
            node.setAttribute("transform", `scale(0.0075) translate(${d.x*2711.8}, ${d.y*3130.5})`)
            svg.appendChild(node);
        })

        wrapper.selectAll(".waste_bag")
            .remove()
        
        dataset.bags_waste[year].forEach(d => {
            const node = rc.path(bag_path, {
                stroke: "#000000", 
                strokeWidth:54, 
                fill: "#96bdc6",
                fillStyle:"zigzag",
                fillWeight: 150
            });
            node.classList.add("waste_bag")
            node.setAttribute("transform", `scale(0.0075) translate(${dimensions.margin.left/0.0075 + dimensions.boundedWidth/0.0075 + d.x*2711.8}, ${d.y*3130.5})`)
            svg.appendChild(node);
        })


        wrapper.selectAll(".recycle_bag")
            .remove()

        dataset.bags_recycle[year].forEach(d => {
            const node = rc.path(bag_path, {
                stroke: "#000000", 
                strokeWidth:54, 
                fill: "#96bdc6",
                fillStyle:"zigzag",
                fillWeight: 150
            });
            node.classList.add("recycle_bag")
            node.setAttribute("transform", `scale(0.0075) translate(${dimensions.margin.left/0.0075 + dimensions.boundedWidth/0.0075 + d.x*2711.8}, ${d.y*3130.5})`)
            svg.appendChild(node);
        })
        prevYear = year
    }

    //drawData(year)
    
    let lineX = 0
    drawLineChart().then(([lineChart, lineChartData]) => lineChart.options.hover.onHover= function(event,elements) { 
        
        if(elements.length > 0){
            const value = parseInt(lineChartData[elements[0]._index].year)
            //d3.select("#year").attr("value", value)
            drawData(value+"")
            d3.select("#year_display").html(value)
            d3.select("#chart_data").html(`Pro person <b>${lineChartData[elements[0]._index].total}kg</b> Abfall, 
                wovon <b>${lineChartData[elements[0]._index].rest}kg</b> deponiert oder verbrännt und <b>${lineChartData[elements[0]._index].recycle}kg</b> separat gesammelt.`)
            
            
        }
      })
}



drawChart()


