import { NextResponse } from "next/server";

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

function part(id: string, name: string, basic: string, advanced: string): AnatomyPart {
  return { id, name, basic, advanced };
}

function organ(
  id: string,
  name: string,
  basic: string,
  advanced: string,
  sub: AnatomyPart[],
  tiss: AnatomyPart[],
  cells: AnatomyPart[]
): OrganEntry {
  return { id, name, basic, advanced, subOrgans: sub, tissues: tiss, cells };
}

export async function GET() {
  const anatomy: OrganEntry[] = [
    organ(
      "heart",
      "Heart",
      "Muscular organ that pumps blood. Four chambers: two atria, two ventricles.",
      "Mediastinum; systemic and pulmonary circulation; SA/AV nodes; coronary circulation.",
      [part("atria", "Atria", "Upper chambers receiving blood.", "RA venous, LA oxygenated."), part("ventricles", "Ventricles", "Lower chambers pumping blood.", "RV to pulmonary, LV to aorta."), part("valves", "Valves", "Prevent backflow.", "Mitral, tricuspid, aortic, pulmonary.")],
      [part("myocardium", "Myocardium", "Cardiac muscle layer.", "Striated, intercalated discs."), part("endocardium", "Endocardium", "Inner lining.", "Endothelium, Purkinje fibers.")],
      [part("cardiomyocytes", "Cardiomyocytes", "Contractile cells.", "Intercalated discs, gap junctions."), part("pacemaker-cells", "Pacemaker cells", "Set heart rate.", "SA node, spontaneous depolarization.")]
    ),
    organ("lungs", "Lungs", "Gas exchange: oxygen in, CO2 out. Right 3 lobes, left 2.", "Conducting and respiratory zones; pleura; ventilation–perfusion.", [part("lobes", "Lobes", "Right 3, left 2.", "Bronchopulmonary segments."), part("bronchi", "Bronchi", "Airway branches.", "Primary, lobar, segmental."), part("alveoli", "Alveoli", "Air sacs for gas exchange.", "Type I and II pneumocytes.")], [part("respiratory-epithelium", "Respiratory epithelium", "Airway lining.", "Ciliated, goblet cells.")], [part("type-i-pneumocyte", "Type I pneumocyte", "Gas exchange.", "Squamous, thin."), part("type-ii-pneumocyte", "Type II pneumocyte", "Surfactant.", "Cuboidal, repair.")]),
    organ("liver", "Liver", "Processes nutrients, bile, detox. Right and left lobes.", "Hepatic lobules; portal triad; zonation.", [part("lobes-liver", "Lobes", "Right, left, caudate, quadrate.", "Vascular supply."), part("biliary-tree", "Biliary tree", "Bile drainage.", "Canaliculi to common duct.")], [part("hepatocyte-plates", "Hepatocyte plates", "Sheets of liver cells.", "Between sinusoids.")], [part("hepatocytes", "Hepatocytes", "Main liver cells.", "Metabolism, bile."), part("kupffer-cells", "Kupffer cells", "Liver macrophages.", "Phagocytose in sinusoids.")]),
    organ("kidney", "Kidney", "Filter blood, form urine. Cortex and medulla.", "Nephron; glomerulus; RAAS; concentration gradient.", [part("cortex", "Cortex", "Outer; glomeruli.", "Convoluted tubules."), part("medulla", "Medulla", "Pyramids, loops.", "Countercurrent multiplier."), part("nephron", "Nephron", "Functional unit.", "Glomerulus, PCT, loop, DCT.")], [part("glomerulus", "Glomerulus", "Filtration.", "Podocytes, basement membrane.")], [part("podocytes", "Podocytes", "Filter barrier.", "Foot processes."), part("principal-cells", "Principal cells", "Collecting duct.", "ADH, aldosterone.")]),
    organ("brain", "Brain", "CNS: thought, movement, sensation.", "Cerebrum, cerebellum, brainstem; ventricles; cranial nerves.", [part("cerebrum", "Cerebrum", "Hemispheres, lobes.", "Cortex, white matter."), part("cerebellum", "Cerebellum", "Balance, coordination.", "Purkinje cells."), part("brainstem", "Brainstem", "Midbrain, pons, medulla.", "Vital centers.")], [part("gray-matter", "Gray matter", "Neuron bodies.", "Cortex, nuclei."), part("white-matter", "White matter", "Myelinated axons.", "Tracts.")], [part("neurons", "Neurons", "Nerve cells.", "Axon, dendrites."), part("astrocytes", "Astrocytes", "Support.", "Blood–brain barrier.")]),
    organ("stomach", "Stomach", "Stores, churns food; acid and enzymes.", "Cardia, fundus, body, pylorus; HCl, pepsin.", [part("fundus", "Fundus", "Upper dome.", "Gastric glands."), part("pylorus", "Pylorus", "Opens to duodenum.", "Pyloric sphincter.")], [part("gastric-mucosa", "Gastric mucosa", "Lining with glands.", "Oxyntic, pyloric.")], [part("parietal-cells", "Parietal cells", "HCl, intrinsic factor.", "H+/K+ ATPase."), part("chief-cells", "Chief cells", "Pepsinogen.", "Protein digestion.")]),
    organ("intestine", "Small Intestine", "Digestion and absorption. Duodenum, jejunum, ileum.", "Villi, microvilli; brush border enzymes.", [part("duodenum", "Duodenum", "First part; bile/pancreatic.", "Brunner glands."), part("jejunum", "Jejunum", "Main absorption.", "Long villi."), part("ileum", "Ileum", "B12, bile salts.", "Peyer patches.")], [part("villi", "Villi", "Absorptive projections.", "Lamina propria, lacteal.")], [part("enterocytes", "Enterocytes", "Absorptive cells.", "Microvilli, enzymes.")]),
    organ("spleen", "Spleen", "Filters blood, removes old RBCs, immune.", "White pulp (lymphoid), red pulp.", [part("white-pulp", "White pulp", "Lymphoid.", "PALS, follicles."), part("red-pulp", "Red pulp", "Filtration.", "Cords, sinuses.")], [part("splenic-capsule", "Capsule", "Fibrous.", "Trabeculae.")], [part("splenic-macrophages", "Macrophages", "Phagocytose RBCs.", "Red pulp.")]),
    organ("pancreas", "Pancreas", "Exocrine: digestive enzymes. Endocrine: insulin, glucagon.", "Acinar cells; islets of Langerhans; duct to duodenum.", [part("exocrine-pancreas", "Exocrine", "Acinar, ducts.", "Trypsin, amylase, lipase."), part("endocrine-pancreas", "Endocrine", "Islets.", "Beta: insulin; alpha: glucagon.")], [part("acinar-tissue", "Acinar tissue", "Enzyme secretion.", "Zymogen granules.")], [part("beta-cells", "Beta cells", "Insulin.", "Lower blood glucose."), part("alpha-cells", "Alpha cells", "Glucagon.", "Raise blood glucose.")]),
    organ("gallbladder", "Gallbladder", "Stores and concentrates bile. Releases into duodenum.", "Fundus, body, neck; cystic duct; contraction with CCK.", [part("fundus-gb", "Fundus", "Blind end.", "Stores bile."), part("neck-gb", "Neck", "Cystic duct.", "Spiral valve.")], [part("mucosa-gb", "Mucosa", "Lining.", "Absorbs water.")], [part("cholangiocytes", "Cholangiocytes", "Lining cells.", "Concentrate bile.")]),
    organ("colon", "Large Intestine", "Absorbs water, forms feces. Cecum to rectum.", "Cecum, ascending, transverse, descending, sigmoid; colon; rectum.", [part("cecum", "Cecum", "Appendix attached.", "Ileocecal valve."), part("rectum", "Rectum", "Stores feces.", "Defecation.")], [part("colonic-mucosa", "Colonic mucosa", "No villi.", "Crypts, goblet cells.")], [part("goblet-colon", "Goblet cells", "Mucus.", "Lubrication.")]),
    organ("bladder", "Urinary Bladder", "Stores urine. Expels via urethra.", "Detrusor muscle; trigone; innervation.", [part("trigone", "Trigone", "Base.", "Ureter orifices, internal urethral.")], [part("detrusor", "Detrusor", "Smooth muscle.", "Contraction for voiding.")], [part("urothelium", "Urothelium", "Transitional epithelium.", "Stretch.")]),
    organ("thyroid", "Thyroid Gland", "Produces T3, T4, calcitonin. Metabolism.", "Two lobes, isthmus; follicles; colloid.", [part("lobes-thyroid", "Lobes", "Left, right.", "Isthmus connects.")], [part("follicles-thyroid", "Follicles", "Colloid storage.", "Thyroglobulin.")], [part("follicular-cells", "Follicular cells", "T3, T4.", "Iodine uptake.")]),
    organ("adrenal", "Adrenal Gland", "Cortex: cortisol, aldosterone. Medulla: adrenaline.", "Cortex (zona glomerulosa, fasciculata, reticularis); medulla.", [part("cortex-adrenal", "Cortex", "Steroids.", "Zonae."), part("medulla-adrenal", "Medulla", "Catecholamines.", "Chromaffin cells.")], [part("zona-glomerulosa", "Zona glomerulosa", "Aldosterone.", "Salt balance.")], [part("chromaffin", "Chromaffin cells", "Adrenaline, noradrenaline.", "Medulla.")]),
    organ("thymus", "Thymus", "T-cell maturation. Behind sternum.", "Cortex, medulla; thymocytes; Hassall corpuscles.", [part("cortex-thymus", "Cortex", "Immature T cells.", "Proliferation."), part("medulla-thymus", "Medulla", "Mature T cells.", "Hassall corpuscles.")], [part("epithelium-thymus", "Thymic epithelium", "Nurse cells.", "T-cell development.")], [part("thymocytes", "Thymocytes", "Developing T cells.", "Selection.")]),
    organ("trachea", "Trachea", "Windpipe. Connects larynx to bronchi.", "C-shaped cartilage; pseudostratified ciliated epithelium.", [part("cartilage-rings", "Cartilage rings", "Keep airway open.", "C-shaped.")], [part("tracheal-epithelium", "Epithelium", "Ciliated.", "Mucociliary clearance.")], [part("goblet-trachea", "Goblet cells", "Mucus.", "Trapping.")]),
    organ("esophagus", "Esophagus", "Muscular tube: pharynx to stomach.", "Upper, middle, lower sphincters; peristalsis.", [part("upper-sphincter", "Upper sphincter", "Prevents air.", "Skeletal muscle."), part("lower-sphincter", "Lower sphincter", "LES.", "Prevents reflux.")], [part("muscularis-esophagus", "Muscularis", "Peristalsis.", "Striated then smooth.")], [part("squamous-esophagus", "Squamous epithelium", "Lining.", "Protection.")]),
    organ("diaphragm", "Diaphragm", "Main muscle of respiration. Separates thorax and abdomen.", "Central tendon; crura; openings for aorta, IVC, esophagus.", [part("central-tendon", "Central tendon", "Apex.", "Aponeurosis.")], [part("crura", "Crura", "Posterior.", "Lumbar vertebrae.")], [part("muscle-diaphragm", "Muscle fibers", "Radial.", "Contraction flattens.")]),
    organ("skin", "Skin", "Largest organ. Protection, sensation, thermoregulation.", "Epidermis, dermis, hypodermis; appendages.", [part("epidermis", "Epidermis", "Outer layer.", "Keratinocytes, strata."), part("dermis", "Dermis", "Connective tissue.", "Collagen, vessels.")], [part("epidermis-tissue", "Epidermis", "Keratinized.", "Stratum corneum.")], [part("keratinocytes", "Keratinocytes", "Keratin.", "Barrier.")]),
    organ("eye", "Eye", "Vision. Cornea, lens, retina.", "Refraction; photoreceptors; optic nerve.", [part("cornea", "Cornea", "Front transparent.", "Refraction."), part("lens", "Lens", "Focus.", "Accommodation."), part("retina", "Retina", "Photoreceptors.", "Rods, cones.")], [part("retina-tissue", "Retina", "Layers.", "RPE, neural retina.")], [part("rods", "Rods", "Low light.", "Rhodopsin."), part("cones", "Cones", "Color.", "Three types.")]),
    organ("bone", "Bone", "Support, protection, calcium. Compact and cancellous.", "Osteoblasts, osteoclasts; Haversian systems.", [part("cortex-bone", "Cortical bone", "Dense.", "Shaft."), part("trabecular", "Trabecular bone", "Spongy.", "Ends.")], [part("compact-bone", "Compact.", "Osteons.", "Haversian canals.")], [part("osteoblasts", "Osteoblasts", "Form bone.", "Matrix."), part("osteoclasts", "Osteoclasts", "Resorb bone.", "Multinucleated.")]),
    organ("muscle", "Skeletal Muscle", "Voluntary movement. Attached to bones.", "Sarcomeres; myofibrils; motor units.", [part("fascicle", "Fascicle", "Bundle of fibers.", "Perimysium.")], [part("myofibril", "Myofibril", "Contractile.", "Sarcomeres.")], [part("myocytes", "Muscle fibers", "Multinucleated.", "Striated.")]),
    organ("spinal-cord", "Spinal Cord", "CNS in vertebral canal. Reflexes, conduction.", "Gray matter (horns), white matter (columns); 31 segments.", [part("gray-horns", "Gray matter", "Anterior, posterior horns.", "Motor, sensory."), part("white-columns", "White matter", "Ascending, descending tracts.", "Myelinated.")], [part("gray-spinal", "Gray.", "Neuron bodies.")], [part("motor-neurons", "Motor neurons", "Anterior horn.", "Innervate muscle.")]),
    organ("lymph-node", "Lymph Node", "Filters lymph; immune response.", "Cortex (follicles), medulla; sinuses.", [part("cortex-node", "Cortex", "B-cell follicles.", "Germinal centers."), part("medulla-node", "Medulla", "Cords.", "Plasma cells.")], [part("sinuses", "Sinuses", "Lymph flow.", "Macrophages.")], [part("lymphocytes-node", "Lymphocytes", "T, B.", "Immune.")]),
    organ("blood-vessel", "Blood Vessels", "Arteries, veins, capillaries. Conduit for blood.", "Tunica intima, media, adventitia; endothelium.", [part("artery", "Artery", "Thick wall.", "Elastic, muscular."), part("vein", "Vein", "Thin, valves.", "Return flow."), part("capillary", "Capillary", "Exchange.", "Single endothelial layer.")], [part("endothelium-vessel", "Endothelium", "Lining.", "Vasoactive.")], [part("endothelial-cells", "Endothelial cells", "Line vessels.", "Friction, permeability.")]),
    organ("nerve", "Peripheral Nerve", "Bundles of axons. Motor and sensory.", "Epineurium, perineurium, endoneurium; fascicles.", [part("fascicle-nerve", "Fascicle", "Bundle of axons.", "Perineurium.")], [part("myelin-nerve", "Myelin", "Schwann cells.", "Saltatory conduction.")], [part("schwann-cells", "Schwann cells", "Myelinate PNS.", "Node of Ranvier.")]),
    organ("appendix", "Appendix", "Vermiform; right lower abdomen. Lymphoid.", "Narrow lumen; GALT; can inflame (appendicitis).", [part("lumen-appendix", "Lumen", "Narrow.", "Can obstruct.")], [part("lymphoid-appendix", "Lymphoid tissue", "GALT.", "Immune.")], [part("epithelium-appendix", "Epithelium", "Columnar.", "Mucus.")]),
    organ("uterus", "Uterus", "Female: houses fetus. Body, cervix.", "Endometrium, myometrium; menstrual cycle.", [part("body-uterus", "Body", "Fundus, corpus.", "Implantation."), part("cervix", "Cervix", "Opens to vagina.", "Os.")], [part("endometrium", "Endometrium", "Lining.", "Cyclic change.")], [part("myometrium", "Myometrium", "Smooth muscle.", "Contraction.")]),
    organ("ovary", "Ovary", "Female gonad. Oocytes, estrogen, progesterone.", "Follicles; corpus luteum; ovulation.", [part("follicles-ovary", "Follicles", "Oocyte development.", "Granulosa cells.")], [part("corpus-luteum", "Corpus luteum", "After ovulation.", "Progesterone.")], [part("oocytes", "Oocytes", "Egg cells.", "Meiosis.")]),
    organ("testis", "Testis", "Male gonad. Sperm, testosterone.", "Seminiferous tubules; Leydig cells.", [part("seminiferous", "Seminiferous tubules", "Spermatogenesis.", "Sertoli cells.")], [part("leydig", "Leydig cells", "Testosterone.", "Interstitium.")], [part("spermatogonia", "Spermatogonia", "Sperm precursors.", "Mitosis, meiosis.")]),
  ];

  return NextResponse.json(anatomy);
}
