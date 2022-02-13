let dataList = [
    d3.json('data/tree2.json', d3.autoType),
    d3.csv('data/10wGPS.csv', d3.autoType),
    // d3.csv('data/fossil8_20220213.csv', d3.autoType)
];

window.onload = function () {
    Promise.all(dataList).then(function (datas) {
        fossilData = datas[1];

        fossilData.forEach(function (d) {
            d.rgb = JSON.parse(d.rgb);
        });

        drawTree(datas[0], tree_g, clipTimeWidth, clipTimeHeight);
        setTimeout(function () {
            renderScatter(fossilData, map);
            // map.on('mousemove', event => glyphMousemove(fossilData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));
            mapboxSvg.on('mousemove', event => glyphMousemove(fossilData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));
        }, 5000);
    });
}
