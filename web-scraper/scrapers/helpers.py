def parse_currency_value(value: str | None) -> int | None:
    """
    parse value from COP readable value (e.g. $1.200.000 COP) to
    integer cents value (e.g. 120_000_000)
    """
    if not value:
        return None
    try:
        float_price = float(
            value.replace("$", "")
            .replace(".", "")
            .replace(",", ".")
            .replace("COP", "")
            .strip()
        )
    except (ValueError, AttributeError):
        return None
    return int(float_price * 100)
