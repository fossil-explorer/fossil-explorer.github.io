let dataList = [
    d3.json('data/intervals@3.json', d3.autoType),
    d3.csv('data/fossil8_20220213.csv', d3.autoType)
];

$(function () {
    Promise.all(dataList).then(function (datas) {
        fossilData = datas[1];
        filterData = fossilData;

        drawGeoTimeScale(datas[0], tree_g, timeSvg, timeWidth, timeHeight, clipTimeWidth, clipTimeHeight, hideSmallTicks, timeMargin);
        // https://stackoverflow.com/questions/49780413/is-there-any-idle-event-for-mapbox-gl-js
        map.once('idle', function (e) {
            if (map.isStyleLoaded()) {
                setTimeout(function () {
                    renderScatter(fossilData, map);
                    mapboxSvg.on('mousemove', event => glyphMousemove(fossilData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));
                }, 200);
            }
        });
    });
})
