import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.pharmacy.app',
    appName: 'Pharmacy System',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    }
};

export default config;
