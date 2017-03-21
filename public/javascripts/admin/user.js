$(document).ready(function() {
	$('#navRTC').attr('class', '');
	$('#navHome').attr('class', '');
	$('#navUser').attr('class', 'active');
	$('#navKelas').attr('class', '');

	$('.tabelFlex').flexigrid({
		url: '/admin/ajax/getFlexUser',
		dataType: 'json',
		colModel : [
			{display: 'Kode User (NIP/NRP)', name : 'kode_user', width : 150, align: 'left'},
			{display: 'Email', name : 'e_mail', width :180, align: 'left'},
			{display: 'Nama', name : 'nama_user', width :250,  sortable : true, align: 'left'},
			{display: 'Level', name : 'level', width :100, align: 'left'},
			{display: 'Kelas', name : 'class', width :80, align: 'left'},
			{display: 'Tahun Angkatan', name : 'year_in', width :90, align: 'left'}
			], 
		buttons : [
			{name : 'Add',bclass : 'add',onpress : doaction},
			{separator : true},
	 		{name : 'Edit',bclass : 'edit',onpress : doaction}, 
			{name : 'Delete',bclass : 'delete',onpress : doaction}
			],
		searchitems : [
			{display: 'Nama', name : 'nama', isdefault: true},
			{display: 'Level', name : 'level'}
			],
		sortname: 'nama_user',
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
			$('#modal').load('/admin/ajax/loadFormAddUser'); /*load halaman adduser.ejs dari ajaxRoute :) */
		}
		if (com == 'Edit') {
			editUser(com, grid);
		}
		if (com == 'Delete') {
			hapusUser(com, grid);
		}
	}
	function editUser(com, grid) {
		if ($('.trSelected',grid).length == 1) {
			$('.trSelected td:first', grid).each(function() {
				var key = $(this).text();
				//alert('key edit: ' + key);
				$('#modal').load('/admin/ajax/loadFormEditUser?key='+key);
			});
		} else {
			alert('Pilih data.'); // ganti dg modal alert bawaaan dari theme
		}
	}
	function hapusUser(com, grid) {
		if ($('.trSelected',grid).length == 1) {
			$('.trSelected td:first', grid).each(function() {
				var key = $(this).text();
				//alert('key hapus: ' + key);
				$.getJSON('/admin/ajax/hapusUser', {key: key}, function (response) {
					//alert('response: '+response.status);
					$('.tabelFlex').flexReload();
				});
			});	
		} else {
			alert('Pilih data.'); // ganti dg modal alert bawaaan dari theme
		}
	}
});