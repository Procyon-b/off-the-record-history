var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-77917281-1']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function trackButtonClick(e) {
	_gaq.push(['_trackEvent', e.target.id, 'clicked']);
}

function trackLinkClick(e) {
	_gaq.push(['_trackEvent', e.target.className, 'clicked']);
}

document.addEventListener('DOMContentLoaded', function () {

	var tabContent = document.getElementById('tabs-content'),
		recordList0 = document.getElementById('record-list-0'),
		recordList1 = document.getElementById('record-list-1'),
		deleteBtn = document.getElementById('delete-btn');

	chrome.tabs.query({
		active: true,
    currentWindow: true
	}, function (tabs) {
		var tab = tabs[0];
		if (tab.incognito) {
			tabContent.style.display = 'block';
			recordList0.style.display = 'block';
			recordList1.style.display = 'none';
			deleteBtn.style.display = 'block';

			var recentlyClosed = [],
				allHistory = [],

				incogRecentLocalStorage = localStorage.getItem('incogRecent'),
				incogHistoryLocalStorage = localStorage.getItem('incogHistory');

			recentlyClosed = JSON.parse(incogRecentLocalStorage);
			allHistory = JSON.parse(incogHistoryLocalStorage);

			if (incogRecentLocalStorage != null) {
				if (recentlyClosed.length != 0)
					notNullResponse();
				else
					nullResponse('No records found!')

				showRecord(recentlyClosed, 'record-list-0');
			}
			else
				nullResponse('No records found!');


			if (incogHistoryLocalStorage != null)
				showRecord(allHistory, 'record-list-1');


			var targetTabList = document.getElementById('tabs-content').getElementsByTagName('span');

			for (var i = 0; i < targetTabList.length; i++) {
				targetTabList[i].addEventListener('click', function (event) {

					var tabIndex = this.getAttribute('data-tab-index');
					document.getElementById('tab-bottom-slider').style.left = 225 * tabIndex + 'px';

					var tabsList = document.getElementsByClassName('tab-record-list'),
						tabsListLength = tabsList.length - 1;

					for (var i = 0; i <= tabsListLength; i++) {
						tabsList[i].style.display = 'none';
					}

					var currentTabList = document.getElementById('record-list-' + tabIndex);
					if (currentTabList.getElementsByTagName('li').length == 0)
						nullResponse('No records found!');

					else {
						notNullResponse();
						currentTabList.style.display = 'block';
						currentTabList.scrollTop = 0;
					}

					trackButtonClick(event);

				});
			}

			var recentLinkList = document.getElementsByClassName('recent-target-link');

			for (var i = 0; i < recentLinkList.length; i++) {
				recentLinkList[i].addEventListener('click', function (event) {
					chrome.tabs.create({
						'url': this.getAttribute('href')
					});
					trackLinkClick(event);
				});
			}

			var historyLinkList = document.getElementsByClassName('history-target-link');

			for (var i = 0; i < historyLinkList.length; i++) {
				historyLinkList[i].addEventListener('click', function (event) {
					chrome.tabs.create({
						'url': this.getAttribute('href')
					});
					trackLinkClick(event);
				});
			}
		} else {
			tabContent.style.display = 'none';
			recordList0.style.display = 'none';
			recordList1.style.display = 'none';
			deleteBtn.style.display = 'none';

			chrome.extension.isAllowedIncognitoAccess(function (response) {
				if (!response)
					nullResponse("This extension is for incognito mode only.<br>To allow the extension to work in incognito:<br>1. Open 'chrome://extensions/' window<br>2. Find 'Off The Record History' extension<br>3. Click on 'Details' button<br>4. Find and select the 'Allow in incognito' checkbox");
				else
					nullResponse('This extension is for incognito mode only.');
			});
		}
	})


	document.getElementById('delete-btn').addEventListener('click', function (event) {

		var recentlyClosed = [],
			allHistory = [];

		recentlyClosed = JSON.parse(localStorage.getItem('incogRecent'));
		allHistory = JSON.parse(localStorage.getItem('incogHistory'));

		recentlyClosed.length = 0;
		allHistory.length = 0;

		localStorage.setItem('incogHistory', JSON.stringify(allHistory));
		localStorage.setItem('incogRecent', JSON.stringify(recentlyClosed));

		recordList0.innerHTML = '';
		recordList1.innerHTML = '';
		nullResponse('All records were destroyed!');

		trackButtonClick(event);

	});

	var nullResponse = function (message) {
		document.getElementById('tab-response-content').style.display = 'block';
		document.getElementById('response-text').innerHTML = message;
	}

	var notNullResponse = function () {
		document.getElementById('tab-response-content').style.display = 'none';
		document.getElementById('response-text').innerHTML = '';
	}

});

function showRecord(result, list) {
	var i,
		ul = document.getElementById(list),
		record = result,
		recordLength = record.length - 1,
		ulType = parseInt(list.charAt(list.length - 1));

	for (i = recordLength; i >= 0; i--) {
		var li = document.createElement('li');
		var img = document.createElement('img');
		var favIconUrl = record[i].favIcon;
		if (favIconUrl != undefined)
			img.setAttribute('src', favIconUrl);
		else
			img.setAttribute('src', 'http://tiny.cc/public/images/default-favicon.ico');

		li.appendChild(img);

		var a = document.createElement('a');
		a.setAttribute('href', record[i].url);
		if (ulType)
			a.setAttribute('class', 'history-target-link');
		else
			a.setAttribute('class', 'recent-target-link');

		a.appendChild(document.createTextNode(record[i].title));
		li.appendChild(a);

		var span = document.createElement('span');
		var time = new Date(record[i].timestamp);
		var hour = time.getHours();
		var minutes = time.getMinutes();
		if (minutes > 9)
			span.appendChild(document.createTextNode(hour + ":" + minutes));
		else
			span.appendChild(document.createTextNode(hour + ":0" + minutes));

		li.appendChild(span);
		ul.appendChild(li);
	}
}
