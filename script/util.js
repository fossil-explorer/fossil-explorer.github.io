function filterByBrushToProject(data, selection, svg, map) {
    filterData = data.filter(d => selection[1] <= +d.age_to && +d.age_from <= selection[0]);
    updateScatterData(filterData, deckScatterLayer);
    mapboxSvg.on('mousemove', event => glyphMousemove(filterData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));

}

function filterByClickTreeToProject(data, age, node_g, map) {
    // https://stackoverflow.com/questions/35948669/how-to-check-if-a-value-exists-in-an-object-using-javascript/57944826
    filterData = data.filter(d => Object.values(d).indexOf(age) > -1)
    if (filterData.length === 0 || age === '') {
        console.log("No Data");
        return;
    }

    updateScatterData(filterData, deckScatterLayer);
    mapboxSvg.on('mousemove', event => glyphMousemove(filterData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));
}

function updateScatterData(data, layer) {
    // https://github.com/visgl/deck.gl/blob/master/docs/api-reference/layer.md#updatetriggers-object-optional
    layer.setProps({
        data: data,
        // getFillColor: d => JSON.parse(d.rgb),
        // updateTriggers: {
        //     getFillColor: d => JSON.parse(d.rgb)
        // }
    });
}

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function drag(simulation) {
    function dragStart(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragEnd(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on('start', dragStart)
        .on('drag', dragged)
        .on('end', dragEnd);
}

function closeImage() {
    d3.select('#imageWindow')
        .style('display', 'none')
        .style('z-index', -10);
    d3.select('#tooltip')
        .style('display', 'none')
        .style('z-index', -10);
    d3.select('#fsimg')
        .style('display', 'none');
    d3.selectAll('.node')
        .attr('stroke', '#222')
        .attr('stroke-width', 0.5);
}

function initAllNodeStroke() {
    node_g.selectAll('.fossil > circle')
        .style('stroke', '#777');
}

function tooltipMouseIn(event, d) {
    d3.select('#tooltip')
        .style('display', 'block')
        .style('z-index', 10000)
        .style('transform', `translate(${event.x + 15}px, ${event.y}px)`)
        .html(`
            Family: ${d['family']}<br>
            Genus: ${d['genus']}<br>
            Age: ${d['age']}<br>
            CommunityID: ${d['communityID']}<br>
            Species: ${d['species'].length > 1 ? d['species'].join('/') : d['species'][0]}
        `);
}

function tootipMouseOut(event) {
    d3.select(this).style('stroke', '#777');
    d3.select('#tooltip')
        .style('display', 'none')
        .style('z-index', -10);

    initAllNodeStroke();
}