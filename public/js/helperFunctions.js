function log(text)
{
	console.log('log: ' + text);
}

function timestamp() 
{
	return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

function LOGWORMS()
{
	log(worms[0].getName());
	log(worms[1].getName());
	log(worms[2].getName());
	log(worms[3].getName());
}