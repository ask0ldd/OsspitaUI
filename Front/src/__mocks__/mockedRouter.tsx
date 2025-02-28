import { MemoryRouter } from 'react-router-dom';
import { OptionsProvider } from '../context/OptionsContext';
import { StreamingProvider } from '../context/StreamingContext';
import Chat from '../pages/Chat';

export const MockedRouter = () => (
    <MemoryRouter>
        <StreamingProvider>
            <OptionsProvider>
                <Chat />
            </OptionsProvider>
        </StreamingProvider>
    </MemoryRouter>
);