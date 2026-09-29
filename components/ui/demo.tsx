import PublishedComponent from "@/components/ui/offer-button";

export default function Demo() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center bg-slate-950 p-10">
      <PublishedComponent 
        text="Claim Growth Offer"
        topDrawerText="Limited Q4 Retainers..."
        bottomDrawerText="...Only 3 Slots Left"
      />
    </div>
  );
}
