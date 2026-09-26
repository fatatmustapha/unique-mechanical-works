import {
  Car,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import SellYourCarForm from "@/components/customer/SellYourCarForm";

export default function SellYourCarPage() {
  return (
    <>
      <Navbar solid />

      <main className="min-h-screen bg-snow pt-20 lg:pt-24">
        {/* HEADER */}
        <section className="bg-prussian">
          <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-9 bg-bronze" />

                <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-bronze">
                  Sell with UMW
                </p>
              </div>

              <h1 className="font-heading text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                Sell your car
                <br />
                with confidence.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Tell us about your
                vehicle and our team
                will review the details
                before contacting you
                about the next step.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16 lg:px-12 lg:py-24">
          <div>
            <SellYourCarForm />
          </div>

          {/* SIDEBAR */}
          <aside className="lg:border-l lg:border-prussian/10 lg:pl-10">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-bronze">
              How it works
            </p>

            <div className="mt-7 space-y-8">
              <InfoItem
                icon={
                  <Car size={20} />
                }
                title="Submit your vehicle"
                text="Provide the key details about the car you would like to sell."
              />

              <InfoItem
                icon={
                  <ShieldCheck
                    size={20}
                  />
                }
                title="UMW reviews it"
                text="Our team reviews your submission before anything is listed."
              />

              <InfoItem
                icon={
                  <MapPin size={20} />
                }
                title="Continue with your branch"
                text="The selected UMW branch can contact you regarding the vehicle."
              />

              <InfoItem
                icon={
                  <CheckCircle2
                    size={20}
                  />
                }
                title="Listing after approval"
                text="Approved submissions become an inventory draft for final review before publication."
              />
            </div>

            <div className="mt-10 border-t border-prussian/10 pt-7">
              <p className="font-heading text-xl font-bold text-prussian">
                Already submitted a car?
              </p>

              <p className="mt-3 text-sm leading-6 text-slate">
                Your submissions and
                their review status will
                be available from your
                UMW account.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

function InfoItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-bronze/40 text-bronze">
        {icon}
      </div>

      <div>
        <h2 className="font-heading text-lg font-bold text-prussian">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate">
          {text}
        </p>
      </div>
    </div>
  );
}