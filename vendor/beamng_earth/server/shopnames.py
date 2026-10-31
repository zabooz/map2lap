"""Words for the signs of buildings whose use is known but whose name isn't, in the country's language (countries
without a list here get English).

Businesses (buildings.names_for: a hall on an industrial estate, a mapped retail building with no place in it): an
invented name, a surname and a trade word picked by the building's seed, so every build gives a building the same
name. A building with no known use gets none: a sign where nothing says there is a business would be invented twice.
The surnames are each language's common ones, none a retail brand's (Hofer is Austria's Aldi).

Public buildings (buildings.signs_for): what their lettering says where it names no place ("FEUERWEHR" over a fire
station's gates, "SCHULE"), and a hotel's blade.
"""

LANGS = {}
for _lang, _codes in {
        "de": ("AT", "DE", "CH", "LI"),
        "fr": ("FR", "MC", "LU"),
        "it": ("IT", "SM", "VA"),
        "es": ("ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "BO", "UY", "PY", "CR", "PA", "GT", "HN", "SV", "NI",
               "DO", "CU"),
        "pt": ("PT", "BR", "AO", "MZ"),
        "nl": ("NL", "BE"),
        "sl": ("SI",),
        "pl": ("PL",)}.items():
    for _c in _codes:
        LANGS[_c] = _lang

SURNAMES = {
    "de": ("Gruber", "Huber", "Wagner", "Pichler", "Moser", "Steiner", "Berger", "Fuchs", "Eder", "Kogler", "Mayer",
           "Schmid", "Leitner", "Weber", "Winkler", "Lechner"),
    "en": ("Hartley", "Morgan", "Bennett", "Carter", "Hughes", "Turner", "Parker", "Collins", "Foster", "Reed", "Walsh",
           "Price", "Mason", "Sutton", "Hayes", "Porter"),
    "fr": ("Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Girard", "Roux", "Fournier", "Mercier", "Blanc",
           "Garnier", "Chevalier", "Faure", "Rousseau"),
    "it": ("Rossi", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "Mancini",
           "Lombardi", "Moretti", "Barbieri"),
    "es": ("García", "Fernández", "López", "Martínez", "Sánchez", "Romero", "Navarro", "Torres", "Ruiz", "Ortega",
           "Molina", "Castro", "Delgado", "Vidal"),
    "pt": ("Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Rodrigues", "Martins", "Sousa", "Fernandes", "Gomes",
           "Lopes", "Carvalho", "Ribeiro", "Almeida"),
    "nl": ("de Vries", "Jansen", "Bakker", "Visser", "Smit", "Meijer", "de Boer", "Mulder", "Bos", "Vos", "Peters",
           "Hendriks", "Dekker", "Brouwer"),
    "sl": ("Novak", "Horvat", "Kovačič", "Krajnc", "Zupančič", "Potočnik", "Kos", "Vidmar", "Golob", "Turk", "Kralj",
           "Mlakar", "Rozman", "Bizjak"),
    "pl": ("Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kamiński", "Lewandowski", "Zieliński", "Szymański",
           "Woźniak", "Dąbrowski", "Kozłowski", "Mazur"),
}

# kind (buildings.names_for: shop, retail = a sales hall, industrial) -> trade words; PATTERN puts them in order
TRADES = {
    "de": {"shop": ("Handel", "Moden", "Geschenke", "Haushaltswaren", "Sport", "Optik"),
           "retail": ("Markt", "Baumarkt", "Möbel", "Großhandel", "Gartencenter"),
           "industrial": ("Metallbau", "Holzbau", "Logistik", "Maschinenbau", "Transporte", "Elektrotechnik",
                          "Stahlbau")},
    "en": {"shop": ("Store", "Goods", "Outfitters", "Supply", "Hardware", "Gifts"),
           "retail": ("Market", "Home Center", "Furniture", "Wholesale", "Garden Center"),
           "industrial": ("Fabrication", "Logistics", "Manufacturing", "Industries", "Steel", "Freight", "Machine Works")},
    "fr": {"shop": ("Boutique", "Maison", "Épicerie", "Bazar", "Optique"),
           "retail": ("Marché", "Brico", "Meubles", "Jardinerie"),
           "industrial": ("Métallerie", "Transports", "Industrie", "Menuiserie", "Mécanique")},
    "it": {"shop": ("Bottega", "Negozio", "Casa", "Bazar", "Ottica"),
           "retail": ("Mercato", "Brico", "Mobili", "Ingrosso"),
           "industrial": ("Metalli", "Trasporti", "Industria", "Officine", "Carpenteria")},
    "es": {"shop": ("Tienda", "Comercial", "Bazar", "Óptica"),
           "retail": ("Mercado", "Bricolaje", "Muebles", "Almacenes"),
           "industrial": ("Metálicas", "Transportes", "Industrias", "Talleres", "Maderas")},
    "pt": {"shop": ("Loja", "Casa", "Bazar", "Ótica"),
           "retail": ("Mercado", "Móveis", "Armazéns"),
           "industrial": ("Metalúrgica", "Transportes", "Indústrias", "Serralharia")},
    "nl": {"shop": ("Winkel", "Mode", "Huis", "Optiek"),
           "retail": ("Markt", "Bouwmarkt", "Meubelen", "Groothandel"),
           "industrial": ("Metaalbouw", "Transport", "Industrie", "Machinebouw")},
    "sl": {"shop": ("Trgovina", "Butik", "Optika"),
           "retail": ("Market", "Pohištvo", "Gradbeni center"),
           "industrial": ("Kovinarstvo", "Transport", "Gradnje", "Strojegradnja")},
    "pl": {"shop": ("Sklep", "Dom", "Butik", "Optyk"),
           "retail": ("Market", "Meble", "Hurtownia"),
           "industrial": ("Metal", "Transport", "Zakład", "Stolarnia")},
}
PATTERN = {"de": "{s} {t}", "en": "{s} {t}", "nl": "{s} {t}", "fr": "{t} {s}", "it": "{t} {s}", "es": "{t} {s}",
           "pt": "{t} {s}", "sl": "{t} {s}", "pl": "{t} {s}"}


def invented(country, kind, seed):
    """A business name for a building of kind ("shop", "retail" or "industrial") in country (ISO code or None), from
    seed (0..1, the building's). Pure."""
    lang = LANGS.get(str(country or "").upper(), "en")
    names, trades = SURNAMES[lang], TRADES[lang].get(kind) or TRADES[lang]["shop"]
    k = int(float(seed) * 1_000_003)
    return PATTERN[lang].format(s=names[k % len(names)], t=trades[(k // len(names)) % len(trades)])


# kind (buildings.PUBLIC_KINDS but "public", which has no word of its own) -> the word over the entrance
PUBLIC = {
    "de": {"fire_station": "FEUERWEHR", "police": "POLIZEI", "town_hall": "RATHAUS", "school": "SCHULE",
           "kindergarten": "KINDERGARTEN", "hospital": "KRANKENHAUS", "post": "POST", "library": "BIBLIOTHEK",
           "station": "BAHNHOF"},
    "en": {"fire_station": "FIRE STATION", "police": "POLICE", "town_hall": "TOWN HALL", "school": "SCHOOL",
           "kindergarten": "PRESCHOOL", "hospital": "HOSPITAL", "post": "POST OFFICE", "library": "LIBRARY",
           "station": "STATION"},
    "fr": {"fire_station": "SAPEURS-POMPIERS", "police": "POLICE", "town_hall": "MAIRIE", "school": "ÉCOLE",
           "kindergarten": "ÉCOLE MATERNELLE", "hospital": "HÔPITAL", "post": "LA POSTE", "library": "BIBLIOTHÈQUE",
           "station": "GARE"},
    "it": {"fire_station": "VIGILI DEL FUOCO", "police": "POLIZIA", "town_hall": "MUNICIPIO", "school": "SCUOLA",
           "kindergarten": "SCUOLA DELL'INFANZIA", "hospital": "OSPEDALE", "post": "UFFICIO POSTALE",
           "library": "BIBLIOTECA", "station": "STAZIONE"},
    "es": {"fire_station": "BOMBEROS", "police": "POLICÍA", "town_hall": "MUNICIPALIDAD", "school": "ESCUELA",
           "kindergarten": "JARDÍN INFANTIL", "hospital": "HOSPITAL", "post": "CORREOS", "library": "BIBLIOTECA",
           "station": "ESTACIÓN"},
    "pt": {"fire_station": "BOMBEIROS", "police": "POLÍCIA", "town_hall": "PREFEITURA", "school": "ESCOLA",
           "kindergarten": "CRECHE", "hospital": "HOSPITAL", "post": "CORREIOS", "library": "BIBLIOTECA",
           "station": "ESTAÇÃO"},
    "nl": {"fire_station": "BRANDWEER", "police": "POLITIE", "town_hall": "GEMEENTEHUIS", "school": "SCHOOL",
           "kindergarten": "KINDEROPVANG", "hospital": "ZIEKENHUIS", "post": "POSTKANTOOR", "library": "BIBLIOTHEEK",
           "station": "STATION"},
    "sl": {"fire_station": "GASILSKI DOM", "police": "POLICIJA", "town_hall": "OBČINA", "school": "ŠOLA",
           "kindergarten": "VRTEC", "hospital": "BOLNIŠNICA", "post": "POŠTA", "library": "KNJIŽNICA",
           "station": "ŽELEZNIŠKA POSTAJA"},
    "pl": {"fire_station": "STRAŻ POŻARNA", "police": "POLICJA", "town_hall": "URZĄD GMINY", "school": "SZKOŁA",
           "kindergarten": "PRZEDSZKOLE", "hospital": "SZPITAL", "post": "POCZTA", "library": "BIBLIOTEKA",
           "station": "DWORZEC"},
}
# a country's own word where its language's differs (an Austrian village's town hall is its Gemeindeamt; Spain's an
# ayuntamiento, Latin America's a municipalidad; Portugal's a câmara municipal, Brazil's a prefeitura)
PUBLIC_COUNTRY = {"AT": {"town_hall": "GEMEINDEAMT"}, "ES": {"town_hall": "AYUNTAMIENTO", "kindergarten":
                  "ESCUELA INFANTIL"}, "MX": {"town_hall": "PRESIDENCIA MUNICIPAL"},
                  "PT": {"town_hall": "CÂMARA MUNICIPAL", "kindergarten": "JARDIM DE INFÂNCIA", "post": "CTT"},
                  "GB": {"kindergarten": "NURSERY"}, "IE": {"kindergarten": "NURSERY"}}
HOTEL = {"fr": "HÔTEL"}     # (the rest: HOTEL)


def public_word(country, kind):
    """The word on a public building of kind (buildings.PUBLIC_KINDS) in country (ISO code or None), or None for a
    kind without one. Pure."""
    c = str(country or "").upper()
    return PUBLIC_COUNTRY.get(c, {}).get(kind) or PUBLIC[LANGS.get(c, "en")].get(kind)


def hotel_word(country):
    """The word on a hotel's blade in country (ISO code or None). Pure."""
    return HOTEL.get(LANGS.get(str(country or "").upper(), "en"), "HOTEL")
