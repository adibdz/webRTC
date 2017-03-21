$(document).ready(function() {
	$('#navHome').attr('class', '');
	$('#navDrop').attr('class', 'active dropdown');
	$('#navFile').attr('class', '');
	// $('#navLive').attr('class', '');
	$('#navFileUp').attr('class', '');
	$('#navRev').attr('class', '');

	$('.tabelFlex').flexigrid({
		url: '/dosen/ajax/getFlexSlide',
		dataType: 'json',
		colModel : [
			{display: 'ID Presentasi', name : 'id', width : 200, align: 'left'},
			{display: 'Kode Makul', name : 'kode', width :100, align: 'left'},
			{display: 'Nama Mata Kuliah', name : 'nama_matkul_slide', width :300,  sortable : true, align: 'left'},
			{display: 'Chapter', name : 'capter', width :50, align: 'left'},
			{display: 'Jumlah Slide', name : 'jum', width :80, align: 'left'},
			{display: 'Dosen Pengampu', name : 'dos', width :200, align: 'left'}
			], 
		buttons : [
			{name : 'Add',bclass : 'add',onpress : doaction},
	 		{name : 'Edit',bclass : 'edit',onpress : doaction}, 
			{name : 'Delete',bclass : 'delete',onpress : doaction},
			{separator : true},
			{name : 'Create Room',bclass : 'createRoom',onpress : doaction}
			],
		searchitems : [
			{display: 'Nama Makul', name : 'nama_matkul_slide', isdefault: true},
			{display: 'Kode Makul', name : 'kode_matkul_slide', isdefault: true},
			{display: 'ID Presentasi', name : 'id_present', isdefault: true}
			],
		sortname: 'nama_matkul_slide',
		sortorder: 'asc',
		singleSelect : true,
		usepager: true,
		title: 'Data User',
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
			$('#modal').load('/dosen/ajax/loadFormAddSlide'); /*load halaman adduser.ejs dari ajaxRoute :) */
		}
		if (com == 'Edit') {
			editSlide(com, grid);
		}
		if (com == 'Delete') {
			hapusSlide(com, grid);
		}
		if (com == 'Create Room') {
			createRoom(com, grid);
		}
	}
	function editSlide (com, grid) {
		if ($('.trSelected',grid).length == 1) {
			$('.trSelected td:first', grid).each(function() {
				var key = $(this).text();
				//alert('key edit: ' + key);
				$('#modal').load('/dosen/ajax/loadFormEditSlide?key='+key);
			});
		} else {
			alert('Pilih data.'); // ganti dg modal alert bawaaan dari theme
		}
	}
	function hapusSlide (com, grid) {
		if ($('.trSelected',grid).length == 1) {
			$('.trSelected td:first', grid).each(function() {
				var key = $(this).text();
				//alert('key hapus: ' + key);
				$.getJSON('/dosen/ajax/hapusSlide', {key: key}, function (response) {
					//alert('response: '+response.status);
					if (response.status == 1) {
						$('.tabelFlex').flexReload();
					} else{
						alert(response.eror);
					};
				});
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
						$.getJSON('/dosen/ajax/cekJumSlide', {key: key}, function (response) {
							if (response.status == false) {
								$('#modal').load('/dosen/ajax/alertCreateSlide?key='+key);
								/*alert('Slide presentasi belum dibuat');*/
							} else {
								$('#modal').load('/dosen/ajax/loadFormAddRoom?key='+key+'&reveal=true');
							}
						});
					} else {
						$('#modal').load('/dosen/ajax/alertOnAir');
						/*alert('Room anda masih berlangsung. Harap tutup terlebih dahulu untuk membuat room baru.');*/
					}
				});
			});
		} else {
			alert('Pilih data.'); // ganti dg modal alert bawaaan dari theme
		}
	}
});