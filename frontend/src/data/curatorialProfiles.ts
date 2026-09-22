import type { CuratorialProfile } from "../types/curation";

export const curatorialProfiles: CuratorialProfile[] = [
  {
    nodeId: "designer:Vionnet",
    eyebrow: "Designer",
    title: "Madeleine Vionnet",
    dates: "1876–1975",
    summary:
      "A radical interpreter of the body whose work drew on classical drapery and the spatial logic of Japanese dress.",
    themes: ["Ancient Greek sculpture", "Japanese kimono", "Bias cutting"],
  },
  {
    nodeId: "designer:Balenciaga",
    eyebrow: "Designer",
    title: "Cristóbal Balenciaga",
    dates: "1895–1972",
    summary:
      "A master of cut and volume whose garments increasingly stood away from the body, using the properties of fabric to create precise, architectural silhouettes.",
    themes: ["Sculptural volume", "Silhouette", "Kimono collar"],
  },
  {
    nodeId: "designer:Chanel",
    eyebrow: "Designer",
    title: "Gabrielle Chanel",
    dates: "1883–1971",
    summary:
      "A designer who recast modern dress through practical construction, supple knitted fabrics and an ease of movement drawn from sportswear.",
    themes: ["Jersey", "Sportswear", "Practical construction"],
  },
  {
    nodeId: "designer:Charles James",
    eyebrow: "Designer",
    title: "Charles James",
    dates: "1906–1978",
    summary:
      "A designer who approached dress as sculpture, engineering complex seams and internal structures to produce highly controlled forms around the body.",
    themes: ["Sculptural form", "Complex seaming", "Engineering"],
  },
  {
    nodeId: "designer:Grès",
    eyebrow: "Designer",
    title: "Madame Grès",
    dates: "1903–1993",
    summary:
      "A virtuoso of fabric manipulation whose classically inspired gowns used draping, gathering and fine pleating to shape cloth directly around the body.",
    themes: ["Ancient Greek sculpture", "Drape", "Pleat"],
  },
  {
    nodeId: "designer:Lanvin",
    eyebrow: "Designer",
    title: "Jeanne Lanvin",
    dates: "1867–1946",
    summary:
      "A couturière who combined youthful femininity with meticulous workmanship, from the robe de style to inventive textile manipulation and colour.",
    themes: ["Robe de style", "Textile manipulation", "Lanvin blue"],
  },
  {
    nodeId: "designer:McCardell",
    eyebrow: "Designer",
    title: "Claire McCardell",
    dates: "1905–1958",
    summary:
      "A pioneer of American fashion who brought mobility and practicality to mass-produced clothing through natural fabrics, adaptable construction and relaxed silhouettes.",
    themes: ["Natural fabrics", "Movement", "Ready-to-wear"],
  },
  {
    nodeId: "designer:Schiaparelli",
    eyebrow: "Designer",
    title: "Elsa Schiaparelli",
    dates: "1890–1973",
    summary:
      "An iconoclastic couturière who brought Surrealist ideas into fashion through experimental materials, provocative imagery and exuberant ornament.",
    themes: ["Surrealism", "Experimental materials", "Ornament"],
  },

  {
    nodeId: "sourceworld:Ancient Greek sculpture",
    eyebrow: "Source world",
    title: "Ancient Greek sculpture",
    summary:
      "Drapery, weight and movement become a vocabulary for garments shaped around the body rather than imposed upon it.",
    themes: ["Drape", "Weight", "Movement"],
    metDepartments: ["Greek and Roman Art"],
  },
  {
    nodeId: "sourceworld:Japanese kimono",
    eyebrow: "Source world",
    title: "Japanese kimono",
    summary:
      "Flat construction and economical cutting offer another route into garments whose form emerges through the body.",
    themes: ["Flat construction", "Geometry", "Economy of cut"],
    metDepartments: ["Asian Art", "The Costume Institute"],
  },

  {
    nodeId: "sourceworld:Spanish painting",
    eyebrow: "Source world",
    title: "Spanish painting",
    summary:
      "Portraiture, dark tonal ranges and the theatrical handling of cloth offer a vocabulary of silhouette, surface and ceremony.",
    themes: ["Portraiture", "Silhouette", "Dramatic contrast"],
    metDepartments: ["European Paintings"],
  },
  {
    nodeId: "concept:Drape",
    eyebrow: "Concept",
    title: "Drape",
    summary:
      "The way cloth falls, hangs and forms itself under gravity in relation to the body.",
    atlasNote:
      "Drape connects material behaviour to movement, allowing cloth itself to participate in the shaping of a garment.",
    themes: ["Gravity", "Movement", "Body"],
  },
  {
    nodeId: "concept:Loom",
    eyebrow: "Concept",
    title: "Loom",
    summary:
      "The structure through which warp and weft are interlaced to produce woven cloth.",
    atlasNote:
      "Here, the loom stands for textile structure before the garment: the ordered crossing of threads from which surfaces emerge.",
    themes: ["Weaving", "Structure", "Thread"],
  },
  {
    nodeId: "concept:Fragment",
    eyebrow: "Concept",
    title: "Fragment",
    summary:
      "A surviving or isolated part whose incompleteness can make material, construction and absence newly visible.",
    atlasNote:
      "Fragments encourage attention to edges, traces and partial forms rather than treating incompleteness as a defect.",
    themes: ["Trace", "Edge", "Absence"],
  },
  {
    nodeId: "concept:Mask",
    eyebrow: "Concept",
    title: "Mask",
    summary:
      "A covering that alters, conceals or intensifies the presentation of the face.",
    atlasNote:
      "In this atlas, the mask sits between adornment and transformation, asking how covering can create a new visible identity.",
    themes: ["Covering", "Identity", "Transformation"],
  },
  {
    nodeId: "concept:Figure",
    eyebrow: "Concept",
    title: "Figure",
    summary:
      "The represented or imagined body around which clothing, gesture and silhouette are organised.",
    atlasNote:
      "Figure shifts attention between the body itself and the forms that clothing constructs around it.",
    themes: ["Body", "Silhouette", "Representation"],
  },
  {
    nodeId: "concept:Surplice",
    eyebrow: "Concept",
    title: "Surplice",
    summary:
      "A loose white ecclesiastical garment with wide sleeves, worn over other clothing.",
    atlasNote:
      "The surplice offers a study in volume, layering and garments whose form depends on what lies beneath them.",
    themes: ["Volume", "Layering", "Ritual dress"],
    etymology:
      "From Medieval Latin superpellicium, literally an “over-fur garment”, originally worn over warmer clothing.",
  },
  {
    nodeId: "concept:Chasuble",
    eyebrow: "Concept",
    title: "Chasuble",
    summary:
      "A sleeveless outer liturgical vestment whose broad surface can read almost as a single shaped plane.",
    atlasNote:
      "The chasuble offers a way of thinking about enclosure, planar construction and cloth forming a volume around the body.",
    themes: ["Plane", "Volume", "Ritual dress"],
    etymology:
      "From Late Latin casubla, related to casula, “little house” or hooded cloak.",
  },
  {
    nodeId: "concept:Habit",
    eyebrow: "Concept",
    title: "Habit",
    summary:
      "A distinctive form of dress associated with a religious order, community or repeated mode of life.",
    atlasNote:
      "Habit brings together clothing, identity and repetition: dress becomes both outward form and social practice.",
    themes: ["Identity", "Repetition", "Ritual dress"],
  },
  {
    nodeId: "concept:Veil",
    eyebrow: "Concept",
    title: "Veil",
    summary:
      "A suspended or worn layer that covers without necessarily concealing completely, mediating between body, surface and what remains visible.",
    atlasNote:
      "The veil is both material and threshold: cloth can obscure, frame or transform the figure while remaining responsive to air and movement.",
    themes: ["Transparency", "Layering", "Movement"],
    etymology:
      "From Latin velum, “sail, curtain or covering”, through Old French veil and modern French voile.",
  },
  {
    nodeId: "concept:Pleat",
    eyebrow: "Concept",
    title: "Pleat",
    summary:
      "A fold formed by doubling cloth back upon itself and securing or controlling the resulting volume.",
    atlasNote:
      "Pleating turns a flat textile into rhythm, depth and expandable structure.",
    themes: ["Fold", "Rhythm", "Volume"],
  },
  {
    nodeId: "concept:Twine",
    eyebrow: "Concept",
    title: "Twine",
    summary:
      "Two or more strands twisted together to form a stronger thread or cord.",
    atlasNote:
      "Twining is both material process and metaphor: separate strands become structure through connection.",
    themes: ["Thread", "Structure", "Connection"],
    etymology:
      "From Old English twin, “double thread”, related to the idea of two.",
  },
  {
    nodeId: "concept:Grosgrain",
    eyebrow: "Concept",
    title: "Grosgrain",
    summary:
      "A firm fabric or ribbon distinguished by pronounced transverse ribs.",
    atlasNote:
      "Its ridged surface turns a structural textile into a visible line, edge or reinforcement.",
    themes: ["Texture", "Structure", "Edge"],
    etymology:
      "From French gros grain, literally “coarse” or “large grain”, referring to its ribbed texture.",
  },
  {
    nodeId: "concept:Bias cut",
    eyebrow: "Concept",
    title: "Bias cut",
    summary:
      "Fabric cut diagonally across the grain, allowing greater elasticity and a more fluid response to the body.",
    atlasNote:
      "Bias cut connects construction to movement: the textile is allowed to fall, stretch and move with the body.",
    themes: ["Construction", "Movement", "Drape"],
  },
];
