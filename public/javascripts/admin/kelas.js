$(document).ready(function() {
	$('#navRTC').attr('class', '');
	$('#navHome').attr('class', '');
	$('#navUser').attr('class', '');
	$('#navKelas').attr('class', 'active');

	$('.tabelFlex').flexigrid({
		url: '/admin/ajax/getFlexKelas',
		dataType: 'json',
		colModel : [
			{display: 'Kode', name : 'kode_kelas', width : 150, sortable : true, align: 'left'},
			{display: 'Nama Kelas', name : 'nama_kelas', width :250, align: 'left'}
			], 
		buttons : [
			{name : 'Add',bclass : 'add',onpress : doaction},
			{separator : true},
	 		{name : 'Edit',bclass : 'edit',onpress : doaction}, 
			{name : 'Delete',bclass : 'delete',onpress : doaction}
			],
		searchitems : [
			{display: 'Nama Kelas', name : 'nama_kelas', isdefault: true}
			],
		sortname: 'kode_kelas',
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
			$('#modal').load('/admin/ajax/loadFormAddKelas'); /*load halaman addKelas.ejs dari ajaxRoute :) */
		}
		if (com == 'Edit') {
			editKelas(com, grid);
		}
		if (com == 'Delete') {
			hapusKelas(com, grid);
		}
	}
	function editKelas(com, grid) {
		if ($('.trSelected',grid).length == 1) {
			$('.trSelected td:first', grid).each(function() {
				var key = $(this).text();
				//alert('key edit: ' + key);
				$('#modal').load('/admin/ajax/loadFormEditKelas?key='+key);
			});
		} else {
			alert('Pilih data.'); // ganti dg modal alert bawaaan dari theme
		}
	}
	function hapusKelas(com, grid) {
		if ($('.trSelected',grid).length == 1) {
			$('.trSelected td:first', grid).each(function() {
				var key = $(this).text();
				//alert('key hapus: ' + key);
				$.getJSON('/admin/ajax/hapusKelas', {key: key}, function (response) {
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
});