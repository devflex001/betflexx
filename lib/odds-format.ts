type OddLike = {
  marketKey?: string
  marketName?: string
  outcomeId?: string
  outcomeName?: string
  outcomeAlias?: string
}

type MatchLike = {
  homeTeam: string
  awayTeam: string
}

function compact(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function isOneXTwoMarket(odd: OddLike) {
  const marketName = compact(odd.marketName ?? "")
  const marketKey = compact(odd.marketKey ?? "")
  return marketName === "1x2" || marketKey.includes("1x2")
}

function inferOneXTwoCode(odd: OddLike, match: MatchLike) {
  const values = [odd.outcomeAlias, odd.outcomeName, odd.outcomeId]
    .filter(Boolean)
    .map((value) => compact(value ?? ""))

  if (values.some((value) => value === "1" || value === "home")) return "1"
  if (values.some((value) => value === "x" || value === "draw")) return "X"
  if (values.some((value) => value === "2" || value === "away")) return "2"

  const home = compact(match.homeTeam)
  const away = compact(match.awayTeam)

  if (values.some((value) => value === home || value.includes(home))) {
    return "1"
  }

  if (values.some((value) => value === away || value.includes(away))) {
    return "2"
  }

  return null
}

export function compareFormattedOdds(a: OddLike, b: OddLike, match: MatchLike) {
  const order = new Map([
    ["1", 1],
    ["X", 2],
    ["2", 3],
  ])

  const aOrder = order.get(formatOddOutcome(a, match).code)
  const bOrder = order.get(formatOddOutcome(b, match).code)

  if (aOrder && bOrder) return aOrder - bOrder
  if (aOrder) return -1
  if (bOrder) return 1

  return 0
}

export function formatOddOutcome(odd: OddLike, match: MatchLike) {
  if (isOneXTwoMarket(odd)) {
    const code = inferOneXTwoCode(odd, match)

    if (code === "1") return { code, meaning: "Home team wins", isCode: true }
    if (code === "X") return { code, meaning: "Draw", isCode: true }
    if (code === "2") return { code, meaning: "Away team wins", isCode: true }
  }

  return {
    code: odd.outcomeAlias || odd.outcomeName || odd.outcomeId || "Selection",
    meaning: "",
    isCode: false,
  }
}
