export type Language = 'en' | 'yo' | 'ha' | 'fr';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  clientDispatch: string;
  riderCockpit: string;
  storeDispatch: string;
  newDelivery: string;
  historyLog: string;
  mapConnected: string;
  setMapsKey: string;
  online: string;
  offline: string;
  todaysPayout: string;
  referADriver: string;
  referralBonus: string;
  emergencySos: string;
  weatherTelemetry: string;
  scanQrToOnboard: string;
  shareReferralLink: string;
  totalEarnings: string;
  pendingBonuses: string;
  completedOnboardings: string;
  languageName: string;
  selectLanguage: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'SWIFTLOGIX',
    tagline: 'ENTERPRISE LOGISTICS',
    clientDispatch: 'Client Dispatch',
    riderCockpit: 'Rider Cockpit',
    storeDispatch: 'Store Dispatch',
    newDelivery: 'New Delivery',
    historyLog: 'Delivery History',
    mapConnected: 'Map Connected',
    setMapsKey: 'Set Maps Key',
    online: 'Online',
    offline: 'Offline Queue',
    todaysPayout: "Today's Payout",
    referADriver: 'Refer-a-Driver',
    referralBonus: 'Referral Bonus',
    emergencySos: 'Emergency SOS',
    weatherTelemetry: 'Route Weather Telemetry',
    scanQrToOnboard: 'Scan QR Code to Onboard Rider',
    shareReferralLink: 'Share Referral Link',
    totalEarnings: 'Total Bonus Earned',
    pendingBonuses: 'Pending Bonus Payouts',
    completedOnboardings: 'Completed Onboardings',
    languageName: 'English',
    selectLanguage: 'Language',
  },
  yo: {
    appName: 'SWIFTLOGIX',
    tagline: 'ÌFIRÁNṢẸ́ PATAKI',
    clientDispatch: 'Ìfiránṣẹ́ Oníbara',
    riderCockpit: 'Pápá Olùwakọ̀',
    storeDispatch: 'Ìfiránṣẹ́ Oloja',
    newDelivery: 'Ìfiránṣẹ́ Tuntun',
    historyLog: 'Agbègbè Ìfipamọ́',
    mapConnected: 'Mápù Ti So pọ̀',
    setMapsKey: 'Fi Bọ́tìnì Mápù Tẹ́',
    online: 'Lori Íńtánẹ́ẹ̀tì',
    offline: 'Ilayi Laisi Íńtánẹ́ẹ̀tì',
    todaysPayout: 'Ere ti Lónìí',
    referADriver: 'Gba Olùwakọ̀ Wọlé',
    referralBonus: 'Ere Ìfipamọ́ Olùwakọ̀',
    emergencySos: 'Pàjáwìrì SOS',
    weatherTelemetry: 'Àbájáde Bẹ́ẹ̀ni Ọjọ́',
    scanQrToOnboard: 'Ṣayẹwo Àmì QR lati Gba Olùwakọ̀',
    shareReferralLink: 'Apin Ìhonà Àmì',
    totalEarnings: 'Papọ̀ Ere ti O Ni',
    pendingBonuses: 'Ere ti O n Duro De',
    completedOnboardings: 'Aṣeyọri Olùwakọ̀ Tuntun',
    languageName: 'Yorùbá',
    selectLanguage: 'Èdè',
  },
  ha: {
    appName: 'SWIFTLOGIX',
    tagline: 'GIRMA DA KASANCI',
    clientDispatch: 'Aikawa Abokin Ciniki',
    riderCockpit: 'Mazaunin Mai Abin Hawa',
    storeDispatch: 'Aikawa Shago',
    newDelivery: 'Sabuwar Aikawa',
    historyLog: 'Tarihin Aikawa',
    mapConnected: 'An Haɗa Taswira',
    setMapsKey: 'Sanya Key Taswira',
    online: 'A Kan Layi',
    offline: 'Babu Layi (Ajiya)',
    todaysPayout: 'Mazan Biyan Yau',
    referADriver: 'Gayyaci Mai Abin Hawa',
    referralBonus: 'Kyautar Gayyata',
    emergencySos: 'Taimakon Gaggawa SOS',
    weatherTelemetry: 'Mahallin Yanayin Sa\'a',
    scanQrToOnboard: 'Duba Lamba QR don Yi Wa Mai Abin Hawa Rijista',
    shareReferralLink: 'Raba Hanyar Gayyata',
    totalEarnings: 'Jumlar Kyautar da Aka Samu',
    pendingBonuses: 'Kyautar da ke Jiran Biya',
    completedOnboardings: 'Masu Abin Hawa da Suka Kammala',
    languageName: 'Hausa',
    selectLanguage: 'Harshe',
  },
  fr: {
    appName: 'SWIFTLOGIX',
    tagline: "LOGISTIQUE D'ENTREPRISE",
    clientDispatch: 'Expédition Client',
    riderCockpit: 'Cockpit du Livreur',
    storeDispatch: 'Expédition Magasin',
    newDelivery: 'Nouvelle Livraison',
    historyLog: 'Historique des Livraisons',
    mapConnected: 'Carte Connectée',
    setMapsKey: 'Définir la Clé Carte',
    online: 'En ligne',
    offline: 'File d\'attente Hors-ligne',
    todaysPayout: 'Paiement du Jour',
    referADriver: 'Parrainer un Chauffeur',
    referralBonus: 'Bonus de Parrainage',
    emergencySos: 'SOS Urgence',
    weatherTelemetry: "Télémétrie Météo de l'Itinéraire",
    scanQrToOnboard: "Scanner le QR Code pour l'Intégration",
    shareReferralLink: 'Partager le Lien de Parrainage',
    totalEarnings: 'Total des Bonus Gagnés',
    pendingBonuses: 'Bonus en Attente',
    completedOnboardings: 'Intégrations Terminées',
    languageName: 'Français',
    selectLanguage: 'Langue',
  },
};
