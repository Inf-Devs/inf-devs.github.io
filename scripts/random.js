/**
	Generates random everything.
	
	@author laifrank2002
	@date 2020-02-15
 */

function randomElementInArray(array)
{
	return array[randomIndex(array.length)];
}

// min inclusive, max exclsusive
function randomIndex(max)
{
	return Math.floor(randomNumber(0,max));
}

// min and max inclusive
function randomInteger(min, max)
{
	return Math.round(randomNumber(min,max));
}

// min and max inclusive
function randomNumber(min, max)
{
	return Math.random() * (max - min) + min;
}

// random for each character, uses only latin a-z
function randomString(length)
{
	var string = "";
	var charset = "abcdefghijklmnopqrstuvwxyz";
	for(var i = 0; i < length; i++)
	{
		var index = randomIndex(charset.length);
		string += charset.substring(index, index + 1);
	}
	return string;
}
