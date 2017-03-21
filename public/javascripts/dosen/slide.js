$(document).ready(function() {
	$('#navHome').attr('class', '');
	$('#navDrop').attr('class', 'active dropdown');
	$('#navFile').attr('class', '');
	// $('#navLive').attr('class', '');
	$('#navFileUp').attr('class', '');
	$('#navRev').attr('class', '');

	$('.tabelFlex').flexigrid({
		url: '/dosen/ajax/getFlexSections',
		dataType: 'json',
		colModel : [
			{display: 'ID Presentasi', name : 'id_present', width : 200, sortable : true, align: 'left'},
			{display: 'Slide Ke-', name : 'slide_ke', width :100, align: 'left'},
			{display: 'Judul Slide', name : 'judul', width :150, align: 'left'},
			{display: 'Isi Slide', name : 'isiSlide', width :300, align: 'left'},
			{display: 'Data Transition', name : 'dt', width :100, align: 'left'},
			{display: 'Data Background', name : 'db', width :100, align: 'left'}
			], 
		buttons : [
			{name : 'Add',bclass : 'add',onpress : doaction},
			{separator : true},
	 		{name : 'Edit',bclass : 'edit',onpress : doaction}, 
			{name : 'Delete',bclass : 'delete',onpress : doaction}
			],
		searchitems : [
			{display: 'ID Presentasi', name : 'id_present', isdefault: true}
			],
		sortname: 'id_present',
		sortorder: 'asc',
		singleSelect : true,
		usepager: true,
		title: 'Data Slide',
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
			$('#modal').load('/dosen/ajax/loadFormAddSections'); /*load halaman adduser.ejs dari ajaxRoute :) */
		}
		if (com == 'Edit') {
			editSection(com, grid);
		}
		if (com == 'Delete') {
			hapusSection(com, grid);
		}
	}
	function editSection(com, grid) {
		if ($('.trSelected',grid).length == 1) {
			var idPres;
			$('.trSelected td:first', grid).each(function() {
				idPres = $(this).text();
			});
			$('.trSelected td:eq(1)', grid).each(function() {
				var idSec = $(this).text();
				// console.log('idPres: '+idPres+', idSec: '+idSec);
				$('#modal').load('/dosen/ajax/loadFormEditSections?idPres='+idPres+'&idSec='+idSec);
			});
		} else {
			alert('Pilih data.'); // ganti dg modal alert bawaaan dari theme
		}
	}
	function hapusSection(com, grid) {
		if ($('.trSelected',grid).length == 1) {
			var idPres;
			$('.trSelected td:first', grid).each(function() {
				idPres = $(this).text();
			});
			$('.trSelected td:eq(1)', grid).each(function() {
				var idSec = $(this).text();
				// console.log('idPres: '+idPres+', idSec: '+idSec);
				$.getJSON('/dosen/ajax/hapusSection', {idPres: idPres, idSec: idSec}, function (response) {
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