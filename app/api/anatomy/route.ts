import { NextResponse } from "next/server";

/* ================= TYPES ================= */

interface AnatomyPart {
  id: string;
  name: string;
  basic: string;
  advanced: string;
}

interface OrganEntry {
  id: string;
  name: string;
  basic: string;
  advanced: string;
  subOrgans: AnatomyPart[];
  tissues: AnatomyPart[];
  cells: AnatomyPart[];
}

/* ================= HELPERS ================= */

function part(
  id: string,
  name: string,
  basic: string,
  advanced: string
): AnatomyPart {
  return { id, name, basic, advanced };
}

function organ(
  id: string,
  name: string,
  basic: string,
  advanced: string,
  subOrgans: AnatomyPart[],
  tissues: AnatomyPart[],
  cells: AnatomyPart[]
): OrganEntry {
  return { id, name, basic, advanced, subOrgans, tissues, cells };
}

/* ================= API ================= */

export async function GET() {
  const anatomy: OrganEntry[] = [

    organ(
      "heart",
      "Heart",
      "Muscular pump that circulates blood.",
      "Four chambers, valves, conduction system.",
      [
        part("atria", "Atria", "Receiving chambers.", "Right & left atrium."),
        part("ventricles", "Ventricles", "Pumping chambers.", "RV → lungs, LV → body"),
      ],
      [
        part("myocardium", "Myocardium", "Muscle layer.", "Cardiac muscle fibers"),
      ],
      [
        part("cardiomyocytes", "Cardiomyocytes", "Contract cells.", "Intercalated discs"),
      ]
    ),

    organ(
      "lungs",
      "Lungs",
      "Gas exchange organs.",
      "Alveoli, bronchi, pleura.",
      [
        part("alveoli", "Alveoli", "Gas exchange sacs.", "Type I & II cells"),
      ],
      [],
      []
    ),

    organ(
      "brain",
      "Brain",
      "Controls body functions.",
      "Cerebrum, cerebellum, brainstem.",
      [
        part("cerebrum", "Cerebrum", "Thinking.", "Cortex & lobes"),
      ],
      [
        part("gray-matter", "Gray Matter", "Neuron bodies.", "Cortex & nuclei"),
      ],
      [
        part("neurons", "Neurons", "Signal cells.", "Axons & dendrites"),
      ]
    ),

    organ(
      "liver",
      "Liver",
      "Metabolism & detox.",
      "Portal triad, lobules.",
      [],
      [],
      [
        part("hepatocytes", "Hepatocytes", "Main liver cells.", "Metabolism"),
      ]
    ),

    organ(
      "kidney",
      "Kidney",
      "Filters blood.",
      "Nephron physiology.",
      [
        part("nephron", "Nephron", "Functional unit.", "Glomerulus + tubules"),
      ],
      [],
      []
    ),

    organ(
      "stomach",
      "Stomach",
      "Food digestion.",
      "Acid & enzymes.",
      [],
      [],
      []
    ),

    organ(
      "intestine",
      "Small Intestine",
      "Absorption of nutrients.",
      "Villi & enzymes.",
      [],
      [],
      []
    ),

    organ(
      "pancreas",
      "Pancreas",
      "Digestive & hormonal.",
      "Insulin & enzymes.",
      [],
      [],
      []
    ),

    organ(
      "spleen",
      "Spleen",
      "Blood filtration.",
      "Red & white pulp.",
      [],
      [],
      []
    ),

    organ(
      "bone",
      "Bone",
      "Support & protection.",
      "Osteons & marrow.",
      [],
      [],
      []
    ),

    organ(
      "muscle",
      "Skeletal Muscle",
      "Movement.",
      "Sarcomeres.",
      [],
      [],
      []
    ),

    organ(
      "spinal-cord",
      "Spinal Cord",
      "Signal conduction.",
      "Gray & white matter.",
      [],
      [],
      []
    ),

    organ(
      "eye",
      "Eye",
      "Vision.",
      "Retina & optic nerve.",
      [],
      [],
      []
    ),

    organ(
      "skin",
      "Skin",
      "Protection.",
      "Epidermis & dermis.",
      [],
      [],
      []
    ),

    organ(
      "uterus",
      "Uterus",
      "Pregnancy organ.",
      "Endometrium.",
      [],
      [],
      []
    ),

    organ(
      "testis",
      "Testis",
      "Sperm production.",
      "Seminiferous tubules.",
      [],
      [],
      []
    ),

    organ(
      "ovary",
      "Ovary",
      "Egg production.",
      "Follicles.",
      [],
      [],
      []
    ),
  ];

  return NextResponse.json(anatomy);
}
