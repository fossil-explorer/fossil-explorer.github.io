let dataList = [
    d3.json('data/tree2.json', d3.autoType),
    d3.csv('data/10wGPS.csv', d3.autoType)
];

window.onload = function () {
    Promise.all(dataList).then(function (datas) {
        fossilData = datas[1];
        filterData = fossilData;

        drawTree(datas[0], tree_g, clipTimeWidth, clipTimeHeight);
        // https://stackoverflow.com/questions/49780413/is-there-any-idle-event-for-mapbox-gl-js
        map.once('idle', function (e) {
            if (map.isStyleLoaded()) {
                setTimeout(function () {
                    renderScatter(fossilData, map);
                    mapboxSvg.on('mousemove', event => glyphMousemove(fossilData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));
                }, 1000);
            }
        });
    });
}