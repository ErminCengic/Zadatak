	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
	}

	const DB_NAME = "IndexedDb";
	const DB_VERSION = 3;
	//window.indexedDB.deleteDatabase(DB_NAME);

	var employeeData = [
		{ name: "Dzenan Dehic", projects: ["projekat A", "projekat C", "projekat B"] },
		{ name: "Sulejman Omerbasic", projects: ["projekat A", "projekat C", "projekat B"] },
		{ name: "Juro Juric", projects: ["projekat C", "projekat B", "projekat A"] },
		{ name: "Kenan Sejdic", projects: ["projekat C", "projekat B", "projekat A"] },
		{ name: "Rusmir Barlov", projects: ["a", "b", "c", "d", "e", "f"] },
		{ name: "Armin Hamzic", projects: ["a", "b", "c", "d", "e", "f"] },
		{ name: "Elmin Delibasic", projects: ["a", "b", "c", "d", "e", "f"] },
		{ name: "Ademir Burgic", projects: ["p1", "p2", "p3", "p4"] },
		{ name: "Zoran Zekic", projects: ["p1", "p2", "p3", "p4"] },
		{ name: "Ivan Bilusic", projects: ["p1", "p2", "p3", "p4"] },
		{ name: "Armin Brkic", projects: ["Projekat II", "p7", "nekiProjekat", "p9"] },
		{ name: "Nermin Fazlic", projects: ["Projekat II", "p7", "nekiProjekat", "p9"] }
	];

	var teamData = [
		{ team: "Team1", employees: ["Dzenan Dehic", "Sulejman Omerbasic", "Juro Juric", "Kenan Sejdic"] },
		{ team: "Team2", employees: ["Rusmir Barlov", "Armin Hamzic", "Elmin Delibasic"] },
		{ team: "Team3", employees: ["Ademir Burgic", "Zoran Zekic", "Ivan Bilusic"] },
		{ team: "Team4", employees: ["Armin Brkic", "Nermin Fazlic"] }
	];

	var years = [
		2018, 2017, 2016, 2015, 2014, 2013,
		2012, 2011, 2010, 2009, 2008
	]

	var db;

	function openDb() {
		var request = window.indexedDB.open(DB_NAME, DB_VERSION);

		var selectYear = document.getElementById("selectYear");
		// add every year as option in selectBox
		for(var i = 0; i < years.length; ++i){
			var option = document.createElement("option");
			option.text = years[i];
			selectYear.add(option);
		}
		/* Create a new database or increase the version number of an existing database,
			onupgradeneeded event will be triggered */
		request.onupgradeneeded = function(event){
			var db = event.target.result;

			/* Create objectStores to hold information about employees, teams, annualReports and monthlyReports */
			var employeeStore = db.createObjectStore("employees", { keyPath: ["name"] });
			var teamStore = db.createObjectStore("teams", { keyPath: ["team"] });
			var annualReportStore = db.createObjectStore("annualReports", { keyPath: ["name", "year"] });
			var monthlyReportStore = db.createObjectStore("monthlyReports", { keyPath: ["name", "year", "month"] });

			employeeStore.createIndex("projects", "projects", { unique: false });
			teamStore.createIndex("employees", "employees", { unique: false });
			annualReportStore.createIndex("months", "months", { unique: false });
			monthlyReportStore.createIndex("works", "works", { unique: false });

			employeeStore.transaction.oncomplete = function(event) {
  	 		var employeeObjectStore = db.transaction("employees", "readwrite").objectStore("employees");

   			employeeData.forEach(function(employee) {
					employee.projects.sort();
   				// add employee to the database
      		employeeObjectStore.add(employee);
					for(var i = 0; i < years.length; ++i){
						addAnnualReports(db, employee, i);
						addMonthlyReports(db, employee, i);
					}
    		});

				var teamObjectStore = db.transaction("teams", "readwrite").objectStore("teams");
				teamData.forEach(function(team) {
					//add team object to the databse
					teamObjectStore.add(team);
				});
  		};

		};//request.onupgradeneeded

		request.onerror = function(event) {
			alert("Request error!");
		};

		//onsuccess
		request.onsuccess = function(event) {
			db = event.target.result;
			var selectTeam = document.getElementById("checkboxes");
			var first = 0;
			var teamStore = db.transaction("teams").objectStore("teams");
			// for every team in database create checkBox in selectBox
			teamStore.openCursor().onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					if(first == 0){
						//first checkBox
						var label = document.createElement("label");
						label.setAttribute("for", "All");

						var span = document.createElement("span");
						span.setAttribute("style", "float:right; margin-right: 5px; cursor:pointer");
						span.addEventListener('click', showCheckboxes, false);
						span.innerHTML = "&#10006";
						label.innerHTML = "<input type='checkbox' id='All' value='All'/>";
						label.appendChild(span);
						selectTeam.appendChild(label);

						++first;
					}
					var label = document.createElement("label");
					label.setAttribute("for", cursor.key);
					label.innerHTML = "<input type='checkbox' id='" + cursor.key + "'value='" + cursor.key + "'/>&nbsp" + cursor.key;
					selectTeam.appendChild(label);

					cursor.continue();
				}
			};

		};//request.onsuccess

	}//openDb

	openDb();

	function addAnnualReports(db, employee, i) {
			// create annualReport object
			var annualReport = {
					name: employee.name,
					year: years[i],
					months: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]
			};
			// add annualReport object to the database (store: annualReports)
		  db.transaction("annualReports", "readwrite").objectStore("annualReports").add(annualReport);
	}

	function addMonthlyReports(db, employee, i) {
		for(var j = 1; j <= 12; ++j){
			var firstDay = new Date(years[i], j-1, 1);
			var day = firstDay.getDay();
			day = day === 0 ? 7 : day;

			var monday = 9 - day;
			var mondays = []; //array of every monday in month
			var count = new Date(years[i], j, 0).getDate(); //number of days in month

			if(monday >= 8)
				monday = 1;

			while(monday <= count){
				mondays.push(monday);
				monday += 7;
			}

			var work = [];
			/* for every monday in month create workObject with monday, available, and projects,
				every project have name and time work */
			for(var k = 0; k < mondays.length; ++k){
				var project = [];
				employee.projects.forEach(function(p) {
					var projectObject = { projectName: p, time: 0 }
					project.push(projectObject);
				});

				var workObject = { monday: mondays[k], available: -1, projects: project };
				work.push(workObject);
			}
			/* Create monthlyReportObject with name, year, month, and array works
				works contain workObjects */
			var monthlyReport = {name: employee.name, year: years[i], month: j, works: work };
			// add monthlyReport object to the database (store: monthlyReports)
			db.transaction("monthlyReports", "readwrite").objectStore("monthlyReports").add(monthlyReport);
		}
	}

	function filterBtn() {
		document.getElementById("filterBtn").classList.toggle("special");
		document.getElementById("filterContent").classList.toggle("show");
		document.getElementById("annualReport").classList.toggle("show");

		var div = document.getElementById("annualReport");
		while(div.firstChild){
		  div.removeChild(div.firstChild);
		}

		closePopup();
	}

	var expanded = false;
	function showCheckboxes() {
		var checkboxes = document.getElementById("checkboxes");
		if(expanded){
			checkboxes.style.display = "none";
			expanded = false;
		}
		else{
			checkboxes.style.display = "block";
			expanded = true;
		}
	}

  function showBtn() {
		var checkedBoxes = []; // all checked boxes
		var checkboxes = document.querySelectorAll('#checkboxes input[type=checkbox]:checked');
		for (var i = 0; i < checkboxes.length; i++) {
			checkedBoxes.push("'" + checkboxes[i].value + "'");
			checkboxes[i].checked = false;
		}

		if(checkedBoxes.length <= 0){
			alert("Please select team");
			return false;
		}

		// close filter content div
  	filterBtn();
		showCheckboxes();

  	var selectYear = document.getElementById("selectYear");
  	var year = selectYear.options[selectYear.selectedIndex].text;

  	var objectStore = db.transaction("teams").objectStore("teams");
		// for every checked box create annualReport table
		objectStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if(cursor) {
				if(checkedBoxes.includes("'All'"))
					createTable(cursor.key, year, cursor);
				else if(checkedBoxes.includes("'" + cursor.key + "'"))
					createTable(cursor.key, year, cursor);
				cursor.continue();
			}
		};
  }

	//annualReport table
	function createTable(team, year, cursor) {
		var annualReport = document.getElementById("annualReport");
			var table = document.createElement("table");
			table.setAttribute("style", "width:100%; border-collapse: collapse; border: 1px solid gray;");

			var tr,th,td;

			tr = document.createElement("tr");
			td = document.createElement("td");
			td.setAttribute("style", "background-color:#f5f6f7; font-weight:bold; text-align:center; border: 1px solid gray;");
			td.setAttribute("colspan", "13");
			td.innerHTML = team;
			tr.appendChild(td);
			table.appendChild(tr)

			// table header Name
			tr = document.createElement("tr");
			th = document.createElement("th");
			th.setAttribute("style", "background-color:#e5e8e8; font-weight:bold; align:center; width: 20%; border: 1px solid gray;");
			th.innerHTML = "Name";
			tr.appendChild(th);

			var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			// table header months
			for(var i = 0; i < months.length; ++i) {
				th = document.createElement("th");
				th.setAttribute("style", "background-color:#e5e8e8; font-weight:bold; align:center; border: 1px solid gray;");
				th.innerHTML = months[i];
				tr.appendChild(th);
			}
			table.appendChild(tr);

			var employees = [];
			for(var i = 0; i < cursor.value.employees.length; ++i){
				employees.push(cursor.value.employees[i]);
			}
			employees.sort();

			var reportStore = db.transaction("annualReports").objectStore("annualReports");
			var temp = 0;

			var totalMonths = []; // array total percentage for every month
			// for every employee create row with percentage in months
			employees.forEach(function(employee) {
			  var req = reportStore.get([employee, parseInt(year)]);

				req.onsuccess = function(event) {
					++temp;
					tr = document.createElement("tr");
					if(temp%2 == 0)
						tr.style.backgroundColor = "#fafafa";
					td = document.createElement("td");
					td.setAttribute("style", "align:left; width:20%; border: 1px solid gray;");
					td.setAttribute("id", team + "_" + temp);
					td.innerHTML = "&nbsp" + employee;
					tr.appendChild(td);

					for(var i = 0; i < months.length; ++i) {
						td = document.createElement("td");
						td.setAttribute("style", "text-align:right; border: 1px solid gray; cursor:pointer;");
						td.setAttribute("id", team + "_" + employee + "_" + (i+1));
						// onclick call openPopup function
						td.addEventListener('click',function(e) {
     					openPopup(e.target.id, year);
     				} ,false);
						if(totalMonths.length < 12)
								totalMonths.push({ sum: 0, count: 0 });

						if( req.result.months[i] != "-") {
							td.innerHTML = parseFloat(req.result.months[i]).toFixed(1) + "% &nbsp";

							totalMonths[i].sum += parseFloat(parseFloat(req.result.months[i]).toFixed(1));
							totalMonths[i].count += 1;
						} else {
							td.innerHTML = "-" + "&nbsp";
						}

						tr.appendChild(td);
					}
					table.appendChild(tr);

					if(temp >= employees.length){
						tr = document.createElement("tr");
						td = document.createElement("td");
						td.setAttribute("style", "background-color:#e5e8e8; font-weight:bold; text-align:right; width:20%; border: 1px gray solid;");
						td.innerHTML = "Total: &nbsp";
						tr.appendChild(td);

						var sum = 0;
						for(var i = 0; i < 12; ++i) {
							td = document.createElement("td");
							td.setAttribute("style","background-color:#e5e8e8; font-weight:bold; text-align:right; border:1px gray solid;");
							td.setAttribute("id", "total_" + team + (i+1));

							var total = 0;
							if(totalMonths[i].count != 0)
								total = (totalMonths[i].sum / totalMonths[i].count).toFixed(1);

							td.innerHTML = total + "%&nbsp";
							tr.appendChild(td);
						}
						table.appendChild(tr);
					}

				};
			});

			annualReport.appendChild(table);
			annualReport.appendChild(document.createElement("br"));
	}

	function openPopup(id, year) {
		closePopup();
		showPopup(id, year);
	}

	function showPopup(id, year) {
		var popupDiv = document.getElementById("popupDiv");
		var center = "position: fixed; width: 515px; background-color: #FFF; left:25%; top:25%;";
		popupDiv.setAttribute("style", "display:block; border:1px gray solid;" + center);

		var parseId = id.split("_");
		var team = parseId[0];
		var name = parseId[1];
		var month = parseId[2];

		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		// add month year and name to popupDiv header
		var header = document.createElement("h2");
		header.setAttribute("style", "align:left; margin-left: 10px;");
		header.innerHTML = months[month-1] + " " + year + " (" + name + ")";

		// span for close popup
		var span = document.createElement("span");
		span.setAttribute("style", "float:right; cursor:pointer; margin-right:5px;");
		span.innerHTML = "&#10006";
		span.addEventListener('click', closePopup, false);

		header.appendChild(span);
		popupDiv.appendChild(header);

		var hr = document.createElement("hr");
		hr.setAttribute("style", "border-width: 1px; border-color: rgb(250,250,255);");
		popupDiv.appendChild(hr);
		popupDiv.appendChild(document.createElement("br"));

		// create monthlyReport table
		var table = document.createElement("table");
		table.setAttribute("id", "monthTable");
		table.setAttribute("style", "width: 500px; border-collapse: collapse; border: 1px solid gray; margin-left: 10px;");
		var tr, td, th;
		tr = document.createElement("tr");

		var reportStore = db.transaction("monthlyReports").objectStore("monthlyReports");
		// get monthlyReport object
		var request = reportStore.get([name, parseInt(year), parseInt(month)]);
		request.onsuccess = function(event) {
			var works = request.result.works;
			th = document.createElement("th");
			th.setAttribute("style", "background-color:#e5e8e8; font-weight:bold; align:center; width:'20%'; border: 1px solid gray;");
			th.innerHTML = "Project(s)";
			tr.appendChild(th);

			var secondTr = document.createElement("tr");
			secondTr.setAttribute("id", "available_" + name);
			var secondTd = document.createElement("td");
			secondTd.setAttribute("style", "align:center; width:'20%'; border: 1px solid gray;");
			secondTd.innerHTML = "&nbspAvailable";
			secondTr.appendChild(secondTd);

			var sumColumn = [];

			for(var i = 0; i < works.length; ++i){
				th = document.createElement("th");
				th.setAttribute("style", "background-color:#e5e8e8; font-weight:bold; align:center; width:'6.6%'; border: 1px solid gray;");

				var mondayMonth;
				if(works[i].monday < 10)
					mondayMonth = "0" + works[i].monday;
				else
					mondayMonth = works[i].monday;

				if(parseInt(month) < 10)
					mondayMonth += ".0" + month;
				else
					mondayMonth += "." + month;

				// table header with mondays in month
				th.innerHTML = mondayMonth;
				tr.appendChild(th);

				// available row
				secondTd = document.createElement("td");
				secondTd.setAttribute("style", "text-align:left; width:'6.6%'; border: 1px solid gray;");
				secondTd.setAttribute("contenteditable", "true");
				secondTd.addEventListener('focus', function(e) {
						document.execCommand('selectAll', false, null)
					}, false);

				if(works[i].available == -1)
					secondTd.innerHTML = "&nbsp-";
				else
					secondTd.innerHTML = "&nbsp" + works[i].available;
				secondTr.appendChild(secondTd);

				// for every monday create objectColumn and add to array sumColumn
				// work is sum of work days for every project for current monday
				var objectColumn = { available: 0, work: 0 };
				objectColumn.available = works[i].available;
				sumColumn.push(objectColumn);
			}
			table.appendChild(tr);
			table.appendChild(secondTr);

			var numProjects = works[0].projects.length;
			// for every project create row
			for(var i = 0; i < numProjects; ++i){
				tr = document.createElement("tr");
				if( i%2 == 0 || i == 0)
					tr.style.backgroundColor = "#fafafa";
				td = document.createElement("td");
				td.setAttribute("style", "align:left; width:'20%'; border: 1px solid gray;");
				td.innerHTML = "&nbsp" + works[0].projects[i].projectName;
				tr.appendChild(td);

				// for every monday increase sum work
				for(var j = 0; j < works.length; ++j){
					td = document.createElement("td");
					td.setAttribute("style", "text-align:left; width:'6.6%'; border: 1px solid gray; cursor:pointer;");
					td.setAttribute("contenteditable", "true");
					td.addEventListener('focus', function(e) {
						document.execCommand('selectAll',false,null)
					}, false);
					td.innerHTML = "&nbsp" + parseFloat(works[j].projects[i].time).toFixed(1);
					tr.appendChild(td);

					sumColumn[j].work = parseFloat(sumColumn[j].work) + parseFloat(works[j].projects[i].time);
				}
				table.appendChild(tr);
			}

			// last row
			tr = document.createElement("tr");
			td = document.createElement("td");
			td.setAttribute("style", "background-color:#e5e8e8; text-align:right; width:'20%'; border: 1px gray solid;");
			td.innerHTML = "Utilization: &nbsp";
			tr.appendChild(td);

			for(var i = 0; i < works.length; ++i){
				td = document.createElement("td");
				td.setAttribute("style","background-color:#e5e8e8; text-align:right; width:'6.6%'; border:1px gray solid;");

				var utilization = -1;
				if(sumColumn[i].available != -1 && sumColumn[i].available != 0 && sumColumn[i].available != "-"){
					utilization = ( sumColumn[i].work / sumColumn[i].available ) * 100;
				}
				if(utilization == -1)
					td.innerHTML = "- &nbsp";
				else
					td.innerHTML = utilization.toFixed(1) + "% &nbsp";

				tr.appendChild(td);
			}
			table.appendChild(tr);
			popupDiv.appendChild(table);

			// button - Save all changes
			var button = document.createElement("button");
			button.setAttribute("type", "button");
			button.setAttribute("style", "width: 90px; margin-left: 10px; margin-top:2px;");
			button.innerHTML = "Save";
			button.addEventListener('click',function(e) {
     		save(team, name, parseInt(year), parseInt(month))
     	} ,false);

			popupDiv.appendChild(button);
			popupDiv.appendChild(document.createElement("br"));
			popupDiv.appendChild(document.createElement("br"));
		};

	}

	function closePopup() {
		var div = document.getElementById("popupDiv");
		div.style.display = "none";
		while(div.firstChild){
			div.removeChild(div.firstChild);
		}
		return true;
	}



	function save(team, name, year, month) {
		if(!confirm("Do you want to save changes?"))
			return false;

		// get all element in available row
		var td = document.getElementById("available_" + name).children;
		available = [];
		for(var i = 1; i < td.length; ++i){
			var value = parseFloat(td[i].textContent);
			if(value || value == 0){
				if(value < 0 || value > 5){
					alert("Fields 'available' must be in the range of [0,5]");
					return false;
				}
				else
					available.push(value.toFixed(1));
			}
			else{
				if((td[i].textContent).trim() == "-"){
					available.push(-1);
				}
				else{
					alert("Fields 'available' must only contain numbers");
					return false;
				}
			}
		}

		var tableChildren = document.getElementById("monthTable").children;
		var works = [];
		for(var i = 2; i < tableChildren.length - 1; ++i){
			var tr = tableChildren[i].children;
			var worksObject = { work: [] };
			worksObject.name = tableChildren[i].children[0].textContent;
			for(var j = 1; j < tr.length; ++j){
				var value = parseFloat(tr[j].textContent);
				if(value || value == 0){
					if(value < 0){
						alert("Fields must only contain positive numbers");
						return false;
					}
					worksObject.work.push(value.toFixed(1));
				}
				else{
					alert("Fields must only contain numbers");
					return false;
				}
			}
			works.push(worksObject);
		}

		var sumWeek = [];
		for(var i = 0; i < works.length; ++i){
			for(var j = 0; j < works[i].work.length; ++j){
				if(sumWeek.length <= j)
					sumWeek.push(0);

				sumWeek[j] = parseFloat(sumWeek[j]) + parseFloat(works[i].work[j]);
			}
		}

		percentageWeek = [];
		var percentage;
		for(var i = 0; i < available.length; ++i){
			if(available[i] == -1){
				tableChildren[tableChildren.length-1].children[i+1].innerHTML = "- &nbsp"
				percentageWeek.push(-1);
				continue;
			}
			if(available[i] < sumWeek[i]){
				alert("The sum of working days should not be greater than available");
				return false;
			}

			if(available[i] == 0)
				percentage = parseFloat(0);
			else
				percentage = parseFloat((sumWeek[i] / available[i]) * 100);

			percentage = percentage.toFixed(1);
			tableChildren[tableChildren.length-1].children[i+1].innerHTML = percentage + "% &nbsp";

			percentageWeek.push(percentage);
		}

		if(percentageWeek.indexOf(-1) == -1 ){
			var percentageTotal = 0;
			for(var i = 0; i < percentageWeek.length; ++i)
				percentageTotal = parseFloat(percentageTotal) + parseFloat(percentageWeek[i]);

			percentageTotal /= percentageWeek.length;
			updateAnnualReport(team, name, year, month, percentageTotal.toFixed(1));
		}
		else{
			updateAnnualReport(team, name, year, month, "-")
		}

		updateMonthlyReport(name, year, month, available, works);
	}

	// update annualReport
	function updateAnnualReport(team, name, year, month, total){
		var reportStore = db.transaction("annualReports","readwrite").objectStore("annualReports");
		var request = reportStore.get([name, year]);
		request.onsuccess = function(event) {
			var data = event.target.result;
			data.months[month-1] = total;
			var requestUpdate = reportStore.put(data);
			requestUpdate.onsuccess = function(event) {
				var element = document.getElementById(team + "_" + name + "_" + month);
				if(total == "-")
					element.innerHTML = "- &nbsp";
				else
					element.innerHTML = total + "% &nbsp";

				updateTotalMonth(team, month);
			};
		};
	}

	function updateTotalMonth(team, month) {
		var total = document.getElementById("total_" + team + month);
		var teamStore = db.transaction("teams").objectStore("teams");
		var request = teamStore.get([team]);
		var percentage = [];
		request.onsuccess = function(event) {
			var employees = request.result.employees;
			employees.forEach(function(employee) {
				var element = document.getElementById(team + "_" + employee + "_" + month);
				if((element.textContent).trim() != "-")
					percentage.push((element.textContent).trim());
			});
			if(percentage.length == 0)
				total.innerHTML = "- &nbsp";
			else{
				var sum = 0;
				for(var i = 0; i < percentage.length; ++i){
					var x = percentage[i].substring(0, percentage[i].length-1);
					sum =  parseFloat(sum) + parseFloat(x);
				}
				sum = parseFloat(sum / percentage.length).toFixed(1);
				total.innerHTML = sum + "% &nbsp";
			}
		}
	}

	// updateMonthlyReport
	function updateMonthlyReport(name, year, month, available, works) {
		var reportStore = db.transaction("monthlyReports","readwrite").objectStore("monthlyReports");
		var request = reportStore.get([name, year, month]);
		request.onsuccess = function(event) {
			var data = event.target.result;
			for(var i = 0 ; i < available.length; ++i){
				if(available[i] == -1)
					data.works[i].available = "-";
				else
					data.works[i].available = available[i];

				for(var j = 0; j < works.length; ++j){
					var project = data.works[i].projects[j].projectName;
					var index = -1;
					for(var k = 0; k < works.length; ++k){
						if(works[k].name.trim() == project)
							index = k;
					}
					if(index != -1)
						data.works[i].projects[j].time = works[index].work[i];
				}
			}

			var requestUpdate = reportStore.put(data);
			requestUpdate.onsuccess = function(event) {
				closePopup();
			}
		}
	}




