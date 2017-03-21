$(document).ready(function() {
	$('#navHome').attr('class', '');
	$('#navDrop').attr('class', 'dropdown');
	$('#navFile').attr('class', '');
	// $('#navLive').attr('class', '');
	$('#navFileUp').attr('class', 'active');
	$('#navRev').attr('class', '');

	$('.tabelFlex').flexigrid({
		url: '/dosen/ajax/getFlexFile',
		dataType: 'json',
		colModel : [
			{display: 'ID', name : 'id', width : 300, align: 'left', hide: true},
			{display: 'Nama File', name : 'nama_file_alias', width : 300, align: 'left'},
			{display: 'Kode Makul', name : 'kode_matkul_present', width :100, align: 'left'},
			{display: 'Nama Mata Kuliah', name : 'nama_matkul', width :300,  sortable : true, align: 'left'},
			{display: 'Chapter', name : 'capter', width :50, align: 'left'},
			{display: 'Dosen Pengampu', name : 'dos', width :200, align: 'left'},
			{display: 'Path', name : 'path', width :300, align: 'left', hide: true}
			], 
		buttons : [
			{name : 'Add',bclass : 'add',onpress : doaction},
	 		// {name : 'Edit',bclass : 'edit',onpress : doaction}, 
			{name : 'Delete',bclass : 'delete',onpress : doaction},
			{separator : true},
			{name : 'Create Room',bclass : 'createRoom',onpress : doaction}
			],
		searchitems : [
			{display: 'Nama File', name : 'nama_file_alias', isdefault: true},
			{display: 'Kode Makul', name : 'kode_matkul_present', isdefault: true}
			],
		sortname: 'kode_matkul_present',
		sortorder: 'asc',
		singleSelect : true,
		usepager: true,
		title: 'Data File Terupload',
		useRp: true,
		rp: 10,
		showTableToggleBtn : true,
		maxwidth: true,
		height: 250,
		pagetext: 'Hal',
		outof: 's.d'
	});

	function doaction( com, grid ) {
		if (com == 'Add') {
			$('#modal').load('/dosen/ajax/loadFormUpload'); /*load halaman adduser.ejs dari ajaxRoute :) */
		}
		if (com == 'Delete') {
			hapusFile(com, grid);
		}
		if (com == 'Create Room') {
			createRoom(com, grid);
		}
	}

	function hapusFile (com, grid) {
		if ($('.trSelected',grid).length == 1) {
			$('.trSelected td:first', grid).each(function () {
				var key = $(this).text();
				$.ajax({
					type	: 'POST',
					url		: '/dosen/ajax/hapusFileUpload',
					data	: 'key=' + key,
					dataType: 'json',
					success	: function(response) {
						//alert("response = "+response.status);
						if(response.status == 1) {
							$('.tabelFlex').flexReload();
						} else if(response.status == 2) {
							alert(response.eror);
						}
						$('#btn').attr('class','btn btn-primary');
					}
				})
				return false;
			});
		} else {
			alert('Pilih data.'); // ganti dg modal alert bawaaan dari theme
		}
	}

	function createRoom (com, grid) {
		if ($('.trSelected',grid).length == 1) {
			$('.trSelected td:first', grid).each(function() {
				var key = $(this).text();
				//alert('key: ' + key);
				$.getJSON('/dosen/ajax/cekPresentasi', function (response) {
					if (response.status == false) {
						// alert('BISA PRESENTASI');
						$('#modal').load('/dosen/ajax/loadFormAddRoom?key='+key+'&reveal=false');
					} else {
						// alert('PRESENTASI MASIH ADA BROOO');
						$('#modal').load('/dosen/ajax/alertOnAir'); 
					}
				});
			});
		} else {
			alert('Pilih data.'); // ganti dg modal alert bawaaan dari theme
		}
	}
});