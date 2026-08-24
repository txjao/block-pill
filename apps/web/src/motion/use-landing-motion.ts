import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useLandingMotion(scope: RefObject<HTMLDivElement | null>) {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = scope.current?.querySelector<HTMLElement>(".hero");
    const impulse = scope.current?.querySelector<HTMLElement>("[data-impulse]");
    const barrier = scope.current?.querySelector<HTMLElement>("[data-barrier]");
    const choice = scope.current?.querySelector<HTMLElement>("[data-choice]");
    if (!hero || !impulse || !barrier || !choice) return;

    const distanceToBarrier = () => barrier.offsetLeft - impulse.offsetLeft - impulse.offsetWidth;
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.65,
        invalidateOnRefresh: true
      }
    });

    timeline
      .fromTo(impulse, { x: 0, opacity: 1 }, { x: distanceToBarrier, duration: 0.68 })
      .fromTo(barrier, { rotate: 17, scaleY: 1 }, { rotate: 10, scaleY: 1.08, duration: 0.1, ease: "power2.out" })
      .fromTo(choice, { scale: 1, boxShadow: "0 0 0 0 rgba(233,45,50,0)" }, { scale: 1.06, boxShadow: "0 0 0 16px rgba(233,45,50,.08)", duration: 0.22, ease: "power2.out" })
      .to(impulse, { opacity: 0, duration: 0.12 });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener("resize", refresh, { passive: true });

    return () => {
      window.removeEventListener("resize", refresh);
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, { scope, dependencies: [] });
}
