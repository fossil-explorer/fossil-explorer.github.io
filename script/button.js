d3.select('#imageWindow .close')
    .on("click", function (event) {
        d3.select('#imageWindow')
            .style('display', 'none')
            .style('z-index', -10);

        d3.select('#fsimg').style('display', 'none');
    });

let isPin = false;
d3.select('body')
    .on('keypress', function (event) {
        if (event.keyCode === 32 && !isPin) {
            isPin = true;
            mapboxSvg.on('mousemove', null);
        } else {
            isPin = false;
            mapboxSvg.on('mousemove', event => glyphMousemove(filterData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));
            closeImage();
        }
        // if (!isPin) {
        //     isPin = true;
        //     mapboxSvg.on('mousemove', null);
        // } else {
        //     isPin = false;
        //     mapboxSvg.on('mousemove', event => glyphMousemove(filterData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));
        //     closeImage();
        // }
    });

let dragx = 0, dragy = 0;
d3.select('#imageWindow .drag')
    .call(
        d3.drag()
            .on('start', function (event) {
                dragx = event.sourceEvent.clientX;
                dragy = event.sourceEvent.clientY;
            })
            .on('drag', function (event) {
                let x = $('#imageWindow').position().left,
                    y = $('#imageWindow').position().top,
                    dx = dragx - event.sourceEvent.clientX,
                    dy = dragy - event.sourceEvent.clientY;
                    dragx = event.sourceEvent.clientX;
                    dragy = event.sourceEvent.clientY;

                // d3.select('#fsimg')
                //     .style('z-index', 5000);
                d3.select('#imageWindow')
                //     .style('z-index', 5001)
                    .style('transform', `translate(${x - dx}px, ${y - dy}px)`);
            })
    );
