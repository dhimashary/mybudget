var budgetController = ( function () {
	
	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		
		if (totalIncome>0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		} else {
			this.percentage = -1;
		}
		
	
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function (type) {
		var sum = 0;
		data.AllItems[type].forEach(function (cur) {
		sum +=  cur.value;	
		}); 
		data.totals[type] = sum;	
	};


	var data = {
		AllItems : {
			exp : [],
			inc : []
		},
		totals : {
			exp : 0,
			inc : 0
		},
		budget : 0,
		percentage: -1
	};

	return {
		addItem : function (type,des,val) {
			var newItem, ID;
			//Buat ID baru
			if (data.AllItems[type].length > 0) {
				ID = data.AllItems[type][data.AllItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			
			//Buat object baru tergantung tipe
			if (type === 'exp') {
				newItem = new Expense(ID, des, val) ; 
			} else if (type === 'inc'){
				newItem = new Income(ID, des, val) ; 
			}
			//Buat masukin ke array
			data.AllItems[type].push(newItem);

			//return
			return newItem; 
		},

		calculateBudget: function () {
			//hitung total income dan expense
			calculateTotal('exp');
			calculateTotal('inc');

			//hitung budget=income-expense
			data.budget = data.totals.inc - data.totals.exp;
			//hitung % expenses
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
			
		},

		calculatePercentages: function () {
			data.AllItems.exp.forEach(
				function (cur) {
					cur.calcPercentage(data.totals.inc);
				});
		},

		getPercentages: function () {
			var Allperc =data.AllItems.exp.map(
				function (cur) {
					return cur.getPercentage();
				});
			return Allperc;
		},

		deleteItem: function (type,id) {
			var ids, index;

			ids = data.AllItems[type].map( function (current) {
				return current.id;
			});

			index = ids.indexOf(id);
			if (index !== -1) {
				data.AllItems[type].splice(index, 1);
			}
		},

		getBudget: function () {
			return {
				budget : data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},
		testing : function () {
			console.log(data);
		}
	};
})();

//-----------UI---------------
var UIController = (function () {
	
	var DOMStrings = {
		inputType : '.add__type',
		inputDesc : '.add__description',
		inputValue : '.add__value',
		InputBtn : '.add__btn',
		incomeContainer : '.income__list',
		expensesContainer : '.expenses__list',
		budgetLabel : '.budget__value',
		incomeLabel : '.budget__income--value',
		expensesLabel : '.budget__expenses--value',
		percentageLabel : '.budget__expenses--percentage',
		container : '.container',
		expPercLabel : '.item__percentage',
		dateLabel : '.budget__title--month'
	};

	var nodeListForEach = function (list, callback) {
				for (var i = 0; i <list.length; i++) {
					callback(list[i], i);
				}

			};

	var formatNumber=  function (num,type) {
			var numSplit, int, dec;
			num = Math.abs(num);
			num = num.toFixed(2);
			numSplit = num.split('.');
			int = numSplit[0];
			if (int.length>3) {
				int = int.substr(0,int.length -3 )  + ',' + int.substr(int.length-3,3);
			}

			dec = numSplit[1];
			
			return (type === 'exp' ?  '-' :  '+') +' ' + int +'.'+ dec;
		};

	return {
		getInput: function () {
		return {
		type : document.querySelector(DOMStrings.inputType).value,
		descr : document.querySelector(DOMStrings.inputDesc).value,
		value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
		};
		},

		addListItem: function (obj, type) {
			// create HTML string with placeholder
			var HTML, newHTML,element;
			if (type === 'inc') {
			element = DOMStrings.incomeContainer;
HTML = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
			element = DOMStrings.expensesContainer;
HTML ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';			
			}
			
			//replace the placeholder to value
			newHTML = HTML.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%',formatNumber(obj.value,type) );
			
			//insert html to DOM
			document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
		},

		displayBudget: function (obj) {
			var type;
			obj.budget > 0 ? type='inc' : type='exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
			
		},

		deleteListItem: function (selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);

		},

		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMStrings.inputDesc
				+ ', '+ DOMStrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function (current, index, array) {
				current.value="";
			});
			
			fieldsArr[0].focus();
		},

		displayPercentages : function (percentages) {
			
			var fields = document.querySelectorAll(DOMStrings.expPercLabel);
			

			nodeListForEach(fields, function (cur, index) {
				if (percentages[index]>0) {
					cur.textContent = percentages[index] + '%';
				} else {
					cur.textContent = '---';
				}
				
			});
		},

		displayMonth: function () {
			var now, year, month, months;
			 now = new Date();
			 months= ['January', 'February', 'March', 
			 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			 month = now.getMonth();
			 year = now.getFullYear();
			 document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changeType: function () {
			var fields = document.querySelectorAll(
				DOMStrings.inputType+','+
				DOMStrings.inputDesc+','+
				DOMStrings.inputValue
				);

			nodeListForEach(fields, function (cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.InputBtn).classList.toggle('red');
		},

		
		getDOMStrings: function () {
		return DOMStrings;
		}
		
	};

})();

//modul controller
var controller = ( function (budgetCtrl, UICtrl) {
	
 	 var setupEventListener = function () {
 		var DOM = UICtrl.getDOMStrings();
 		document.querySelector(DOM.InputBtn).addEventListener('click',ctrlAddItem);
 		document.addEventListener('keypress', function (event) {
 		if (event.keypress==13 || event.which==13) {
 			ctrlAddItem();
 		}});
 		
 		document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
 		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

 	};



 	var updateBudget = function () {
 		
 		//  1 calculate budget
 		budgetCtrl.calculateBudget();

 		//  2 return the budget
 		var budget = budgetCtrl.getBudget();

 		// 3 display on UI 
 		UICtrl.displayBudget(budget);

 	};

 	var updatePercentages = function () {
 		//1 calculate percentages
 		budgetCtrl.calculatePercentages();
 		//2 read percentages from budget controler
 		var percentages = budgetCtrl.getPercentages();
 		//3 update UI
 		UICtrl.displayPercentages(percentages);
 	};

 	var ctrlAddItem = function () {
 		var input, newItem;
 		//1. ambil nilai yang diinput
 		input = UICtrl.getInput();
 		if (input.descr !== "" && !isNaN(input.value) && input.value > 0) {
		//2. kasih nilai yg diinput ke budgetctrl
 		newItem = budgetCtrl.addItem(input.type,input.descr,input.value);
 		//3. kasih nilai yg diinput ke ui 
 		UICtrl.addListItem(newItem,input.type);
 		//4. reset all of that input field
 		UICtrl.clearFields();
 		//5. calculate  dan update budget
 		updateBudget();
 		//Update percentages
 			updatePercentages();
 		} 
 	
 	};

 	var ctrlDeleteItem = function (event) {
 		var itemID,splitID, type, ID;
 		itemID = event.target.parentNode.parentNode.parentNode.id;
 		if (itemID) {
 			splitID = itemID.split('-');
 			type = splitID[0];
 			ID = parseInt(splitID[1]);

 			//hapus item dari data structure
 			budgetCtrl.deleteItem(type,ID);
 			//hapus item dari UI
 			UICtrl.deleteListItem(itemID);
 			//UDPATE dan tampilkan new budget\
 			updateBudget();

 			//Update percentages
 			updatePercentages();
 		}

 	};	

 	return { 
 		init : function () {
 			console.log('app has started');
 			UICtrl.displayMonth();
 			UICtrl.displayBudget({
				budget : 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
 			setupEventListener();
 		}
 	};

}) (budgetController, UIController);

controller.init();