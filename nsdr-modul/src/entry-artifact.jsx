import React from "react";
import { hydrateRoot } from "react-dom/client";
import NSDRModule from "./NSDRModule.jsx";

// Das Markup ist vorgerendert (scripts/build-artifact.mjs); hier wird es nur interaktiv gemacht.
hydrateRoot(document.getElementById("root"), <NSDRModule />);
