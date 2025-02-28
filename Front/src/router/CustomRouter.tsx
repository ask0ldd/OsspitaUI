import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "../pages/Chat";
import Installation from "../pages/Installation";
import { ServicesProvider } from "../context/ServicesContext";
import ImageGen from "../pages/ImageGen";
import { OptionsProvider } from "../context/OptionsContext";
import { StreamingProvider } from "../context/StreamingContext";

function CustomRouter() {

    return (
        <BrowserRouter future={{
          v7_startTransition: true, v7_relativeSplatPath: true,
        }}>
          <ServicesProvider>
            <OptionsProvider>
              <StreamingProvider>
                <Routes>
                  <Route path="/" element={<Installation />} />
                  <Route path="/chat" element={<Chat/>} />
                  <Route path="/imagegen" element={<ImageGen/>} />
                  <Route path="*" element={<Installation />} />
                </Routes>
              </StreamingProvider>
            </OptionsProvider>
          </ServicesProvider>
        </BrowserRouter>
      );
  }
  
  export default CustomRouter