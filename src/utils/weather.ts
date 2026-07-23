export function getWeatherInfo(code: number, isDay: boolean = true) {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: isDay ? 'sun' : 'moon', bgGradient: 'from-amber-400/20 to-orange-500/10' };
    case 1:
      return { label: 'Mainly Clear', icon: isDay ? 'sun-cloud' : 'moon-cloud', bgGradient: 'from-amber-300/20 to-blue-500/10' };
    case 2:
      return { label: 'Partly Cloudy', icon: 'cloud-sun', bgGradient: 'from-blue-400/20 to-slate-500/10' };
    case 3:
      return { label: 'Overcast', icon: 'cloud', bgGradient: 'from-slate-400/20 to-gray-600/10' };
    case 45:
    case 48:
      return { label: 'Foggy', icon: 'cloud-fog', bgGradient: 'from-slate-300/20 to-slate-500/10' };
    case 51:
      return { label: 'Light Drizzle', icon: 'cloud-drizzle', bgGradient: 'from-cyan-400/20 to-blue-600/10' };
    case 53:
      return { label: 'Moderate Drizzle', icon: 'cloud-drizzle', bgGradient: 'from-blue-400/20 to-cyan-600/10' };
    case 55:
      return { label: 'Dense Drizzle', icon: 'cloud-rain', bgGradient: 'from-blue-500/20 to-cyan-700/10' };
    case 61:
      return { label: 'Slight Rain', icon: 'cloud-rain', bgGradient: 'from-blue-500/20 to-indigo-600/10' };
    case 63:
      return { label: 'Moderate Rain', icon: 'cloud-rain', bgGradient: 'from-blue-600/20 to-indigo-700/10' };
    case 65:
      return { label: 'Heavy Rain', icon: 'cloud-heavy-rain', bgGradient: 'from-indigo-600/30 to-blue-900/20' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', icon: 'cloud-sun-rain', bgGradient: 'from-blue-500/20 to-indigo-600/10' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm', icon: 'cloud-lightning', bgGradient: 'from-purple-600/20 to-slate-900/20' };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return { label: 'Snowfall', icon: 'cloud-snow', bgGradient: 'from-indigo-300/20 to-sky-400/10' };
    default:
      return { label: 'Cloudy', icon: 'cloud', bgGradient: 'from-slate-400/20 to-gray-500/10' };
  }
}

export function getRainRiskLevel(rainProbabilityPercent: number) {
  if (rainProbabilityPercent >= 75) {
    return {
      level: 'Very High',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/30',
      badgeBg: 'bg-red-500 text-white',
      badgeText: 'High Risk of Rain',
      advice: 'Rain is almost certain! Bring an umbrella or raincoat.'
    };
  } else if (rainProbabilityPercent >= 50) {
    return {
      level: 'High',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      badgeBg: 'bg-orange-500 text-white',
      badgeText: 'Likely to Rain',
      advice: 'Good chance of rain. Keep rain gear handy.'
    };
  } else if (rainProbabilityPercent >= 25) {
    return {
      level: 'Moderate',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      badgeBg: 'bg-amber-500 text-white',
      badgeText: 'Possible Rain',
      advice: 'Slight risk of showers or drizzle.'
    };
  } else {
    return {
      level: 'Low',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      badgeBg: 'bg-emerald-500 text-white',
      badgeText: 'Dry & Clear',
      advice: 'Very low likelihood of rain. Outdoor friendly!'
    };
  }
}
