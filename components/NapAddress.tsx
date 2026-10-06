import { contact, gym } from "@/data/gym";
import { addressLines } from "@/lib/contact";

// Name + address as a real <address>, in the ONE format shared by Contatti,
// the footer and the JSON-LD (all read from `contact.address`).
export default function NapAddress({ className = "", withName = true }: { className?: string; withName?: boolean }) {
  const [street, city] = addressLines(contact.address);
  return (
    <address className={`not-italic ${className}`}>
      {withName && (
        <>
          <span className="font-semibold text-white">{gym.name}</span>
          <br />
        </>
      )}
      {street}
      <br />
      {city}
    </address>
  );
}
