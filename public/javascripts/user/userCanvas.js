var soc_canvas = io.connect('/soc_canvas');
var path;
soc_canvas.on('connect', function () {
    var roomName = $('#namaRoom').val();
    soc_canvas.emit('join_room', {name: roomName});
    soc_canvas.on('clearCanvasOthers', function () {
        console.log('clearCanvasOthers');
        project.activeLayer.removeChildren(); 
        view.draw(); 
    });
});
soc_canvas.on('mouseDownOthers', function (data) {
    console.log('mouseDownOthers: ', data);
    path = new Path();
    path.add(data.point);
});
soc_canvas.on('drawLineOthers', function (data) {
    console.log('drawLineOthers: ', data);
   	path.fillColor = new RgbColor( data.cJson.red, data.cJson.green, data.cJson.blue, data.cJson.opacity );
    path.add(data.top);
    path.insert(0, data.bottom);
    path.smooth();
    view.draw();
});
soc_canvas.on('mouseUpOthers', function (data) {
    console.log('mouseUpOthers: ', data);
   	path.add(data.point);
    path.closed = true;
    path.smooth();
    view.draw();
});