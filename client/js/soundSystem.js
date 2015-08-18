function SoundSystem()
{
	var musicVolume = 0;
	var effectsVolume = 0.2;
	var titlescreenMusicElement = null;
	var gameMusicElement = null;
	var countDownElement = null;
	var startButtonElement = null;

	var FlagEffect = null;

	var inputSoundPool = null;
	var shotSoundPool = null;
	var whiteShotSoundPool = null;
	var crashEffectSoundPool = null;

	var DeniedEffectSoundPool = null;
	var headShotEffectSoundPool = null;
	var doubleKillEffectSoundPool = null;
	var multiKillEffectSoundPool = null;
	var TargetHitEffectSoundPool = null;


	this.init = function()
	{
		titlescreenMusicElement = new Audio("sounds/titleScreenMusic.mp3");
		titlescreenMusicElement.volume = musicVolume;
		titlescreenMusicElement.loop = true;
		titlescreenMusicElement.play();

		gameMusicElement = new Audio("sounds/gameMusic.mp3");
		gameMusicElement.volume = musicVolume;
		gameMusicElement.loop = true;

		countDownElement = new Audio("sounds/countdownEffect.mp3");
		countDownElement.volume = effectsVolume;

		startButtonElement = new Audio("sounds/startButtonEffect.mp3");
		startButtonElement.volume = effectsVolume;

		inputSoundPool = CreateInputSoundPool(40, effectsVolume);
		shotSoundPool = CreateSoundPool("sounds/shotEffect.mp3", 30, effectsVolume);
		whiteShotSoundPool = CreateSoundPool("sounds/whiteShotEffect.mp3", 8, effectsVolume);
		crashEffectSoundPool = CreateSoundPool("sounds/crashEffect.mp3", 30, effectsVolume);
		headShotEffectSoundPool = CreateSoundPool("sounds/headshotEffect.mp3", 4, effectsVolume);
		doubleKillEffectSoundPool = CreateSoundPool("sounds/doublekillEffect.mp3", 2, effectsVolume);
		multiKillEffectSoundPool = CreateSoundPool("sounds/multikillEffect.mp3", 2, effectsVolume);
		DeniedEffectSoundPool = CreateSoundPool("sounds/deniedEffect.mp3", 2, effectsVolume);
		TargetHitEffectSoundPool = CreateSoundPool("sounds/targetHit.mp3", 5, effectsVolume*2);

		FlagEffect = CreateSoundEffect("sounds/flagEffect.mp3", effectsVolume);
	};

	this.ChangeToTitleScreen = function()
	{
		countDownElement.pause();
		countDownElement.load();
		gameMusicElement.pause();
		gameMusicElement.load();
		titlescreenMusicElement.play();
	};

	this.SetMusicVolume = function(value)
	{
		musicVolume = value;
		titlescreenMusicElement.volume = musicVolume;
		gameMusicElement.volume = musicVolume;
	};

	this.SetEffectsVolume = function(value)
	{
		effectsVolume = value;
		countDownElement.volume = effectsVolume;
		startButtonElement.volume = effectsVolume;
	};

	this.ToggleTitleScreenMusic = function(bool)
	{
		if(bool)
		{
			titlescreenMusicElement.play();
		}
		else
		{
			titlescreenMusicElement.pause();
			titlescreenMusicElement.load();
		}
	};

	this.ToggleGameMusic = function(bool)
	{
		if(bool)
		{
			gameMusicElement.play();
		}
		else
		{
			gameMusicElement.pause();
		}
	};

	this.PlayCountDownEffect = function()
	{	
		countDownElement.play();
	};

	this.PlayStartButtonEffect = function()
	{
		startButtonElement.play();
	};
	
	var currentHeadshotSound = 0;
	this.PlayHeadshotEffect = function()
	{
		if(headShotEffectSoundPool[currentHeadshotSound].currentTime == 0 || 
		   headShotEffectSoundPool[currentHeadshotSound].ended) 
		{
			headShotEffectSoundPool[currentHeadshotSound].volume = effectsVolume;
			headShotEffectSoundPool[currentHeadshotSound].play();
		}

		currentHeadshotSound = (currentHeadshotSound + 1) % headShotEffectSoundPool.length;
	};

	var currentTargetHitEffect = 0;
	this.PlayTargetHitEffect = function()
	{
		if(TargetHitEffectSoundPool[currentTargetHitEffect].currentTime == 0 || 
		   TargetHitEffectSoundPool[currentTargetHitEffect].ended) 
		{
			TargetHitEffectSoundPool[currentTargetHitEffect].volume = effectsVolume;
			TargetHitEffectSoundPool[currentTargetHitEffect].play();
		}

		currentTargetHitEffect = (currentTargetHitEffect + 1) % TargetHitEffectSoundPool.length;
	};

	var currentDoubleKillEffect = 0;
	this.PlayDoubleKillEffect = function()
	{
		if(doubleKillEffectSoundPool[currentDoubleKillEffect].currentTime == 0 || 
		   doubleKillEffectSoundPool[currentDoubleKillEffect].ended) 
		{
			doubleKillEffectSoundPool[currentDoubleKillEffect].volume = effectsVolume;
			doubleKillEffectSoundPool[currentDoubleKillEffect].play();
		}

		currentDoubleKillEffect = (currentDoubleKillEffect + 1) % doubleKillEffectSoundPool.length;
	};

	var currentMultiKillEffect = 0;
	this.PlayMultiKillEffect = function()
	{
		if(multiKillEffectSoundPool[currentMultiKillEffect].currentTime == 0 || 
		   multiKillEffectSoundPool[currentMultiKillEffect].ended) 
		{
			multiKillEffectSoundPool[currentMultiKillEffect].volume = effectsVolume;
			multiKillEffectSoundPool[currentMultiKillEffect].play();
		}

		currentMultiKillEffect = (currentMultiKillEffect + 1) % multiKillEffectSoundPool.length;
	};

	var currentInputSound = 0;
	this.PlayInputEffect = function()
	{
		if(inputSoundPool[currentInputSound].currentTime == 0 || 
		   inputSoundPool[currentInputSound].ended) 
		{
			inputSoundPool[currentInputSound].volume = effectsVolume;
			inputSoundPool[currentInputSound].play();
		}

		currentInputSound = (currentInputSound + 1) % inputSoundPool.length;
	}

	var CurrentDeniedEffect = 0;
	this.PlayDeniedEffect = function()
	{
		if(DeniedEffectSoundPool[CurrentDeniedEffect].currentTime == 0 || 
		   DeniedEffectSoundPool[CurrentDeniedEffect].ended) 
		{
			DeniedEffectSoundPool[CurrentDeniedEffect].volume = effectsVolume;
			DeniedEffectSoundPool[CurrentDeniedEffect].play();
		}

		CurrentDeniedEffect = (CurrentDeniedEffect + 1) % DeniedEffectSoundPool.length;
	};

	var currentShotSound = 0;
	this.PlayShotEffect = function()
	{
		PlaySoundEffect(shotSoundPool, currentShotSound, effectsVolume);
		if(shotSoundPool[currentShotSound].currentTime == 0 || 
		   shotSoundPool[currentShotSound].ended) 
		{
			shotSoundPool[currentShotSound].volume = effectsVolume;
			shotSoundPool[currentShotSound].play();
		}

		currentShotSound = (currentShotSound + 1) % shotSoundPool.length;
	};

	var currentWhiteShotSound = 0;
	this.PlayWhiteShotEffect = function()
	{
		if(whiteShotSoundPool[currentWhiteShotSound].currentTime == 0 || 
		   whiteShotSoundPool[currentWhiteShotSound].ended) 
		{
			whiteShotSoundPool[currentWhiteShotSound].volume = effectsVolume;
			whiteShotSoundPool[currentWhiteShotSound].play();
		}

		currentWhiteShotSound = (currentWhiteShotSound + 1) % whiteShotSoundPool.length;
	};

	this.PlayFlagEffect = function()
	{
		FlagEffect.play();
	};

	var currentcrashEffect = 0;
	this.PlayCrashEffect = function()
	{
		if(crashEffectSoundPool[currentcrashEffect].currentTime == 0 || 
		   crashEffectSoundPool[currentcrashEffect].ended) 
		{
			crashEffectSoundPool[currentcrashEffect].volume = effectsVolume;
			crashEffectSoundPool[currentcrashEffect].play();
		}

		currentcrashEffect = (currentcrashEffect + 1) % crashEffectSoundPool.length;
	};

	this.PlaySoundEffects = function(gameState)
	{
		var length = gameState.CrashEffects.length; 
		if(length > 0)
		{
			for(var i = 0; i < length; i++)
			{
				SoundSystem.PlayCrashEffect();
			}
			gameState.CrashEffects = [];	
		}

		length = gameState.DeniedEffects.length; 
		if(length > 0)
		{
			for(var i = 0; i < length; i++)
			{
				SoundSystem.PlayDeniedEffect();
			}
			gameState.DeniedEffects = [];	
		}

		length = gameState.ShotEffects.length; 
		if(length > 0)
		{
			for(var i = 0; i < length; i++)
			{
				SoundSystem.PlayShotEffect();
			}
			gameState.ShotEffects = [];	
		}

		length = gameState.WhiteShotEffects.length; 
		if(length > 0)
		{
			for(var i = 0; i < length; i++)
			{
				SoundSystem.PlayWhiteShotEffect();
			}
			gameState.WhiteShotEffects = [];	
		}

		length = gameState.HeadShotEffects.length;
		if(length > 0)
		{
			for(var i = 0; i < length; i++)
			{
				SoundSystem.PlayHeadshotEffect();
			}
			gameState.HeadShotEffects = [];	
		}

		length = gameState.CountDownEffects.length; 
		if(length > 0)
		{
			for(var i = 0; i < length; i++)
			{
				SoundSystem.PlayCountDownEffect();
			}
			gameState.CountDownEffects = [];	
		}

		length = gameState.TargetHitEffects.length; 
		if(length > 0)
		{
			for(var i = 0; i < length; i++)
			{
				SoundSystem.PlayTargetHitEffect();
			}
			gameState.TargetHitEffects = [];	
		}
	}
}

function PlaySoundEffect(pool, currentPointer, volume)
{
	if(pool[currentPointer].currentTime == 0 || 
	   pool[currentPointer].ended) 
	{
		pool[currentPointer].volume = volume;
		pool[currentPointer].play();
	}

	currentPointer = (currentPointer + 1) % pool.length;
};

function CreateSoundPool(src, size, volume)
{
	var SoundPool = [];

	for (var i = 0; i < size; i++) 
	{
		var sound = new Audio(src);
		sound.volume = volume;
		sound.load();
		SoundPool[i] = sound;
	}

	return(SoundPool); 
}

function CreateInputSoundPool(size, volume)
{
	var SoundPool = [];

	for (var i = 0; i < size; i++) 
	{
		var random = Math.floor((Math.random() * 4) + 1);

		if(random == 1)
		{
			var tast1 = new Audio("sounds/tast1.mp3");
			tast1.volume = volume;
			tast1.load();
			SoundPool[i] = tast1;
		}	
		else if(random == 2)
		{
			var tast2 = new Audio("sounds/tast2.mp3");
			tast2.volume = volume;
			tast2.load();
			SoundPool[i] = tast2;
		}	
		else if(random == 3)
		{
			var tast3 = new Audio("sounds/tast3.mp3");
			tast3.volume = volume;
			tast3.load();
			SoundPool[i] = tast3;
		}	
		else if(random == 4)
		{
			var tast4 = new Audio("sounds/tast4.mp3");
			tast4.volume = volume;
			tast4.load();
			SoundPool[i] = tast4;
		}	
	}

	return(SoundPool);
}

function CreateSoundEffect(src, volume)
{
	var result = new Audio(src);
	result.volume = volume;
	return(result);
}