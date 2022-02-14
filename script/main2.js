let dataList = [
    d3.json('data/tree2.json', d3.autoType),
    d3.csv('data/10wGPS.csv', d3.autoType)
];

window.onload = function () {
    Promise.all(dataList).then(function (datas) {
        fossilData = datas[1];

        drawTree(datas[0], tree_g, clipTimeWidth, clipTimeHeight);
        setTimeout(function () {
            renderScatter(fossilData, map);
            mapboxSvg.on('mousemove', event => glyphMousemove(fossilData, glyph_g, sunburst_node_g, sunburst_label_g, event, 'map', map));
        }, 1000);

    });
}