(function (exports) 
{
	exports.AddKill =function(worm)
	{
		worm.KillCount++;
		worm.TotalKills++;

		/*switch(worm.KillCount)
		{
			case 1:
				SoundSystem.PlayHeadshotEffect();
				break;
			case 2:
				SoundSystem.PlayDoubleKillEffect();
				break;
			case 3:
				SoundSystem.PlayMultiKillEffect();
				break;
			case 4:
				SoundSystem.PlayMultiKillEffect();
				break;
			case 5:
				SoundSystem.PlayMultiKillEffect();
				break;
			case 6:
				SoundSystem.PlayMultiKillEffect();
				break;
			case 7:
				SoundSystem.PlayMultiKillEffect();
				break;
			case 8:
				SoundSystem.PlayMultiKillEffect();
				break;
		}*/
	}

}(typeof exports === 'undefined' ? this.FILENAME = {} : exports));