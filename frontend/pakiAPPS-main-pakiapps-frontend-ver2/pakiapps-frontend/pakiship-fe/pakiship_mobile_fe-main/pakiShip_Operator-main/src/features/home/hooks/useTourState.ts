import { useState, useRef } from "react";
import { View } from "react-native";
import { shouldShowTour } from "@/components/TourOverlay";

export function useTourState() {
  const [showTour, setShowTour] = useState(false);
  const [tourInitialStep, setTourInitialStep] = useState(0);
  const [actionsSpotlight, setActionsSpotlight] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [statsSpotlight, setStatsSpotlight] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [helpSpotlight, setHelpSpotlight] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const actionsRef = useRef<View>(null);
  const statsRef = useRef<View>(null);

  function measureActions() {
    actionsRef.current?.measureInWindow((x, y, width, height) => {
      setActionsSpotlight({ x, y, width, height });
    });
  }

  function measureStats() {
    statsRef.current?.measureInWindow((x, y, width, height) => {
      setStatsSpotlight({ x, y, width, height });
    });
  }

  function measureAll() {
    measureActions();
    measureStats();
  }

  async function checkFirstLaunch(startIdx = 0) {
    const show = await shouldShowTour();
    if (show) {
      setTimeout(() => {
        measureAll();
        setTourInitialStep(startIdx);
        setShowTour(true);
      }, 600);
    }
  }

  return {
    showTour, setShowTour,
    tourInitialStep, setTourInitialStep,
    actionsSpotlight, statsSpotlight, helpSpotlight, setHelpSpotlight,
    actionsRef, statsRef,
    measureActions, measureStats, measureAll,
    checkFirstLaunch,
  };
}
