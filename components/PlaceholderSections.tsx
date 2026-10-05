// Anchor targets for sections that are not built yet, so in-page links
// (nav, Servizi CTAs) never point at nothing. Replace one by one.
const PLACEHOLDERS = [
  { id: "galleria", label: "Galleria" },
  { id: "orari", label: "Orari" },
  { id: "prezzi", label: "Prezzi" },
  { id: "contatti", label: "Contatti" },
];

export default function PlaceholderSections() {
  return (
    <>
      {PLACEHOLDERS.map(({ id, label }) => (
        <section key={id} id={id} aria-label={label} data-placeholder="true" />
      ))}
    </>
  );
}
