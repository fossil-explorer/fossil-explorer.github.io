let timeWidth = $('#time').width(),
    timeHeight = $('#time').height(),
    timeMargin = {left: 2, top: 0, right: 2, bottom: 0},
    clipTimeWidth = timeWidth - timeMargin.left - timeMargin.right,
    clipTimeHeight = timeHeight - timeMargin.top - timeMargin.bottom,
    neighborWidth = 25,
    font = '12px sans-serif',
    hideSmallTicks = true;

let timeSvg = d3.select('#time').append('svg')
    .attr('width', timeWidth)
    .attr('height', timeHeight)
    .append('g')
    .attr('transform', `translate(${timeMargin.left}, ${timeMargin.top})`);

let tree_g = timeSvg.append('g')
    .attr('class', 'tree_g');

function drawGeoTimeScale(data, g, svg, width, height, clipWidth, clipHeight) {
    let hierarchicalData = d3.stratify()(data)
        .sum(d => (d.leaf ? d.start - d.end : 0))
        .sort((a, b) => b.start - a.start);
    let root = partition(hierarchicalData, clipWidth, clipHeight);
    let focus = root;

    let cellGroup = g.append('g')
        .attr('id', 'cells');

    const cell = cellGroup.selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

    const rect = cell.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => d.data.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 'pointer')
        .on('mouseover', function (event, d) {
            const sequence = d.ancestors().reverse();

            cell.attr('fill-opacity', d => {
                return sequence.includes(d) ? 1.0 : 0.5;
            });
        })
        .on('mouseout', function (event, d) {
            cell.attr('fill-opacity', 1);
        })
        .on('click', clicked);

    cell.append('title')
        .text(d => {
            const sequence = d.ancestors()
                .map(d => d.data.name)
                .reverse();
            return `${sequence.join(' > ')}`;
        });

    const text = cell.append('text')
        .style('user-select', 'none')
        .attr('pointer-events', 'none')
        .attr('x', d => {
            const textx = (d.x1 - d.x0) / 2;
            return Number.isNaN(textx) ? -1000 : textx;
        })
        .attr('y', d => (d.y1 - d.y0) / 2)
        .attr('fill', d => d.data.textColor || 'black')
        .attr('fill-opacity', labelVisible)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(d => {
            const rectWidth = d.x1 - d.x0;
            const labelWidth = getTextWidth(d.data.name, font);
            const abbrev = d.data.abr || d.data.name.charAt(0);
            return rectWidth - 10 < labelWidth ? abbrev : d.data.name;
        });

    svg.call(
        d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([1, 8])
            .on('zoom', zoomed)
            .on('end', () => {
                rect.attr('cursor', 'pointer');
            })
    );

    function clicked(event, p) {
        focus = p === focus ? p.parent : p;
        hideSmallTicks = [0, 1].includes(focus.depth);
        const focusAncestors = focus.ancestors().slice(1); // ignore clicked node itself
        const t = event ? d3.transition().duration(450).ease(d3.easeCubicInOut) : null;

        // Show a bit of the neighbouring cells on focus of an interval
        const leftNeighbor = focus.data.start === root.data.start ? 0 : neighborWidth;
        const rightNeighbor = focus.data.end === root.data.end ? 0 : neighborWidth;
        const focusWidth = focus.x1 - focus.x0;

        root.each(d => {
            const widthMinusNeighbors = clipWidth - rightNeighbor - leftNeighbor;
            d.target = {
                x0: leftNeighbor + ((d.x0 - focus.x0) / focusWidth) * widthMinusNeighbors,
                x1: leftNeighbor + ((d.x1 - focus.x0) / focusWidth) * widthMinusNeighbors,
                y0: d.y0,
                y1: d.y1
            };
        });

        // Reset drag
        g.transition(t).attr("transform", "translate(0, 0)");

        cell
            .transition(t)
            .attr("transform", (d) => `translate(${d.target.x0},${d.target.y0})`);

        rect
            .transition(t)
            .attr("width", (d) => d.target.x1 - d.target.x0)
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        if (event) {
            d3.select(this.parentNode).raise();
        }

        text
            .transition(t)
            .attr("fill-opacity", (d) =>
                focusAncestors.includes(d) ? 1 : labelVisible(d.target)
            )
            .attr("x", (d) => {
                // Position all the ancestors labels in the middle
                if (focusAncestors.includes(d)) {
                    return -d.target.x0 + width / 2;
                }
                const rectWidth = d.target.x1 - d.target.x0;
                const textX = rectWidth / 2;

                return Number.isNaN(textX) ? width / 2 : textX;
            })
            .text((d) => {
                const rectWidth = d.target.x1 - d.target.x0;
                const labelWidth = getTextWidth(d.data.name, font);
                const abbrev = d.data.abr || d.data.name.charAt(0);

                return rectWidth - 8 < labelWidth ? abbrev : d.data.name;
            });

        filterByClickTreeToProject(fossilData, focus.data.name, node_g, map);
    }

    function zoomed(e) {
        if (!root.target) return;

        const translateX = e.transform.x;

        // Do not allow scrolling beyond left- and rightmost node
        // These conditions are not completely correct🚨
        if (translateX + root.target.x0 > 0 || root.x1 - translateX > root.target.x1) return;

        rect.attr("cursor", "grabbing");
        g.attr("transform", `translate(${translateX},0)`);
    }
}

function labelVisible(d) {
    return +(d.x1 - d.x0 > 14);
}

// https://stackoverflow.com/questions/1636842/svg-get-text-element-width
function getTextWidth(text, font) {
    let canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    let context = canvas.getContext('2d');
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width;
}


function partition(data, clipWidth, clipHeight) {
    return d3.partition()
        .size([clipWidth, clipHeight])
        .padding(0)(data);
}