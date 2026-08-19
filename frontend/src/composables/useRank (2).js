const RANKS = {
  hierro:      { label: 'Hierro',      color: 'var(--rank-iron)',      order: 1 },
  bronce:      { label: 'Bronce',      color: 'var(--rank-bronze)',    order: 2 },
  plata:       { label: 'Plata',       color: 'var(--rank-silver)',    order: 3 },
  oro:         { label: 'Oro',         color: 'var(--rank-gold)',      order: 4 },
  platino:     { label: 'Platino',     color: 'var(--rank-platinum)',  order: 5 },
  esmeralda:   { label: 'Esmeralda',   color: 'var(--rank-emerald)',   order: 6 },
  diamante:    { label: 'Diamante',    color: 'var(--rank-diamond)',   order: 7 },
  maestro:     { label: 'Maestro',     color: 'var(--rank-master)',    order: 8 },
  granmaestro: { label: 'Gran Maestro',color: 'var(--rank-gm)',        order: 9 },
  challenger:  { label: 'Challenger',  color: 'var(--rank-challenger)',order: 10 },
}

export function useRank() {
  function normalize(elo) {
    if (!elo) return 'hierro'
    const key = elo.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return RANKS[key] ? key : 'hierro'
  }

  function rankColor(elo) {
    return RANKS[normalize(elo)].color
  }

  function rankLabel(elo) {
    return RANKS[normalize(elo)].label
  }

  function rankOrder(elo) {
    return RANKS[normalize(elo)].order
  }

  const ROLE_ICONS = {
    top: 'M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5z',
    jungla: 'M12 2C8 2 5 6 5 10c0 4 3 8 7 12 4-4 7-8 7-12 0-4-3-8-7-8z',
    mid: 'M4 12h16M12 4v16',
    adc: 'M3 12l6-6v4h12v4H9v4z',
    support: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z',
  }

  function roleIcon(role) {
    const key = role?.toLowerCase()
    return ROLE_ICONS[key] || ROLE_ICONS.mid
  }

  return { normalize, rankColor, rankLabel, rankOrder, roleIcon, RANKS }
}
