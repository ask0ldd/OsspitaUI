import { useContext } from "react";
import { ServicesContext } from "../../context/ServicesContext";

export const useServices = () => useContext(ServicesContext);