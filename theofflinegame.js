var startTime = 0;
var activeScreenN = 0;
var activeScreen = null;
var timer = null;
var nSeconds;

function getScreen(n)
{
	return document.getElementById("screen" + n);
}

function goToScreen(n)
{
	if (activeScreen)
	{
		activeScreen.style.display = "none";
	}
	activeScreen = getScreen(n);
	activeScreenN = n;
	activeScreen.style.display = "block";
}

function formatDuration(duration) {
    //    var sec_num = parseInt(this, 10); // don't forget the second param

    var outputstring = "";

    var hours   = Math.floor(duration / 3600);
    var minutes = Math.floor((duration - (hours * 3600)) / 60);
    var seconds = duration - (hours * 3600) - (minutes * 60);

    if (hours == 1) outputstring += hours + " hour "; 
    if (hours > 1) outputstring += hours + " hours ";
    if (hours > 0)
    {
        if (minutes == 1) outputstring += minutes + " min"; 
        if (minutes > 1) outputstring += minutes + " mins"; 
    }
    else
    {
        if (minutes == 1) outputstring += minutes + " minute"; 
        if (minutes > 1) outputstring += minutes + " minutes"; 
    }
    if (hours == 0 && minutes == 0)
    {
        if (seconds == 1) outputstring += seconds + " second"; 
        else outputstring += seconds + " seconds"; 
    }

    return outputstring;
}

function updateTimer()
{
    var d = new Date();
    nSeconds = Math.round((d.getTime() - startTime)/1000);
    updateUI();
}

function updateUI()
{
    timeString = formatDuration(nSeconds);
    document.getElementById("count3").innerHTML = timeString;
    document.getElementById("count4").innerHTML = timeString;
    if (timer)
    {
        window.document.title = STR_WINTITLE_PLAY.replace("%%",timeString);
    }
    else
    {
        window.document.title = STR_WINTITLE_SCORE.replace("%%",timeString);
    }
}

function startTimer()
{
	var d = new Date();
	startTime = d.getTime();
	timer = setInterval(updateTimer, 1000);
    updateTimer();
}

function stopTimer()
{
    clearInterval(timer);	
    timer = null;
}

function checkOffline(event)
{
    if (navigator.onLine)
    {
        if (activeScreenN == 3)
        {
            //goToScreen(4);
            goToScore(nSeconds);
            stopTimer();
        }
    }
    else
    {
        if (activeScreenN == 1 || activeScreenN == 2)
        {
            startTimer();
            goToScreen(3);
        }
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

var ID = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

function getLocalId() {
    try {
        localStorage.clientId = localStorage.clientId || ID();
        return localStorage.clientId;
    }
    catch {
        return "LOCAL";
    }
}

function getReferralId() {
    var referrer = getQueryVariable("r");
    if (referrer != getLocalId())
        return referrer;
    return null;
}

function getScore() {
    if (getQueryVariable("s"))
    {
        return parseInt(getQueryVariable("s"),36);
    }
    return null;
}

function goToScore(score) {
    try {
        localStorage.highScore = Math.max(parseInt(localStorage.highScore) || 0, score);
    }
    catch {

    }
    window.location.search = "?r="+getLocalId()+"&s="+score.toString(36);
}

function highScore() {
    try {
        return localStorage.highScore; 
    }
    catch {
        if (getReferralId() == getLocalId()) return getScore();
        return null;
    }
}

function updateWelcomeText() {
    var text;
    if (highScore())
    {
        text = STR_LANDING_SCORE.replace("%%",formatDuration(highScore()));
    }
    else if (getScore())
    {
        text = STR_FRIEND_SCORE.replace("%%",formatDuration(getScore()));
    }
    else
    {
        text = STR_LANDING;
    }
    document.getElementById("welcomeText").innerHTML = text;
}

function copyShareLinkToClipboard()
{
    copyTextToClipboard(window.location);
    document.getElementById("challengeButton").innerHTML = STR_COPY;
}

function shareScore() {
    var didShare = false;
    if (navigator.share) {
        navigator.share({
            title: STR_SHARE_TITLE,
            text: STR_SHARE_TEXT.replace("%%",formatDuration(nSeconds)),
            url: window.location,
        })
            .then(() => console.log('Shared!')) 
            .catch(function(error) {
                console.log('Error sharing', error);
                if (error.name !== "AbortError") { copyShareLinkToClipboard() };
            });
    }
    else
    {
        copyShareLinkToClipboard();
    }
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function game_init() {
    window.addEventListener('online',  checkOffline);
    window.addEventListener('offline', checkOffline);

    if (!getReferralId() && getScore())
    {
        nSeconds = getScore();
        updateUI();
        goToScreen(4);
    }
    else {
        updateWelcomeText();
        goToScreen(1);
    }
}

game_init();

