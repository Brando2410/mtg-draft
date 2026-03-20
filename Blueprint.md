# Blueprint Progetto: MTG Custom Cube Draft Simulator (Web App)

## 1. Obiettivo del Progetto
Sviluppare una Web App (preferibilmente PWA per un'ottima resa su mobile) che permetta a un gruppo di utenti (fino a 8) di simulare una draft di Magic: The Gathering in tempo reale, utilizzando pool di carte ("Cube") creati custom. L'app non gestisce le regole di gioco della partita, ma esclusivamente le fasi di creazione pool, generazione buste e la meccanica di "pick & pass" sincrona della draft.

## 2. Architettura Dati e Integrazione API
L'app avrà un'architettura ibrida:

*   **API Esterna:** Utilizzo esclusivo della Scryfall API (REST) per la ricerca delle carte, il recupero dei metadati (rarità, colore) e il recupero delle immagini. Nessuna immagine deve essere salvata sul nostro server.
*   **Database Interno:** Un database leggero (es. Firebase, Supabase, o MongoDB) per salvare i profili utente, le liste degli ID delle carte (Draft Pools) e gestire lo stato delle stanze multiplayer.

## 3. Flussi Utente e Funzionalità Principali

### A. Creazione e Gestione della "Draft Pool" (Il Cubo)
L'utente "Host" deve poter creare una lista custom di carte.

*   **Ricerca:** Barra di ricerca con auto-completamento collegata all'endpoint Scryfall `https://api.scryfall.com/cards/autocomplete` o `/cards/search`.
*   **Aggiunta:** Cliccando sul risultato, la carta viene aggiunta alla Pool.
*   **Salvataggio Dati:** Il sistema non salverà solo l'ID (UUID di Scryfall). Per permettere la futura generazione di buste per rarità senza fare centinaia di chiamate API simultanee, il sistema salverà un oggetto JSON contenente: `scryfall_id`, `name`, `rarity`, `color`, `image_uris.normal`.
*   **Gestione:** L'utente può dare un nome alla Pool, salvarla, modificarla (aggiungere/rimuovere carte) o eliminarla.

### B. Setup della Stanza di Draft (Lobby)
L'Host crea una stanza e genera un link di invito per gli altri giocatori. Prima di avviare, l'Host configura i parametri:

*   **Selezione Pool:** Sceglie quale Draft Pool salvata utilizzare.
*   **Numero Giocatori:** Da 2 a 8.
*   **Regole Buste (Pack Composition):** Quante buste a testa (es. 3) e da quante carte. Deve poter definire il rateo di rarità (es. 1 Rara/Mitica, 3 Non Comuni, 11 Comuni) pescando casualmente dalla Pool selezionata. *Nota per il dev:* se la Pool non ha abbastanza carte di una determinata rarità, il sistema deve gestire il fallback o avvisare l'Host.
*   **Regole di Pick:** Numero di carte da pickare simultaneamente da una busta (solitamente 1, ma a volte 2 per draft speciali).
*   **Timer:** Tempo a disposizione per il pick (es. 60 secondi). Se scade, il sistema effettua un auto-pick (scelta casuale o pick della carta con rarità più alta) per non bloccare il tavolo.

### C. Fase di Draft (Multiplayer Sincrono)
Questa è la vera sfida tecnica. Richiede WebSockets (es. Socket.io o le realtime subscriptions di Supabase).

*   **Distribuzione:** All'avvio, il server genera tutte le buste in memoria (es. 8 giocatori * 3 buste = 24 buste) in base alle regole, ed espone la prima busta a ciascun giocatore.
*   **Logica Pick & Pass:**
    1.  Il giocatore seleziona una carta.
    2.  La carta finisce nella sua "Collezione Personale" visibile a lato/in basso.
    3.  Le carte rimanenti vengono "passate" al giocatore adiacente.
*   **Regola di scorrimento:** Busta 1 gira a sinistra (giocatore N+1), Busta 2 a destra (giocatore N-1), Busta 3 a sinistra.
*   **Stato di Attesa:** Se il Giocatore A è veloce, vedrà una schermata "In attesa del Giocatore B..." finché la busta successiva non gli viene passata.

### D. UI/UX: Leggibilità ed Espandibilità delle Carte
Poiché le carte di Magic hanno molto testo, l'interfaccia durante il pick deve essere curata maniacalmente:

*   **Vista Busta (Main View):** Griglia responsiva con le immagini delle carte della busta corrente. Devono usare le immagini fornite da Scryfall (`image_uris.normal`).
*   **Ispezione Carta:**
    *   *Desktop:* L'hover del mouse (passaggio sopra) deve ingrandire leggermente la carta. Un click destro o un'icona specifica apre un Modal/Overlay.
    *   *Mobile:* Il Tap lungo (Long Press) o un bottone "+" sull'angolo dell'immagine apre l'Overlay.
*   **Modal Overlay (Dettagli):** Il modal deve mostrare l'immagine ad alta risoluzione a tutto schermo e, opzionalmente, il testo "Oracle" (regole pulite testuali prelevate da Scryfall) nel caso l'immagine sia in una lingua straniera o abbia font difficili da leggere (es. versioni promo).
*   **Review Pool Personale:** Il giocatore deve sempre avere accesso, tramite un bottone o un drawer laterale, alle carte che ha già pickato per poter pianificare la sua strategia, filtrate idealmente per costo di mana e colore.

## 4. Requisiti Tecnologici Suggeriti
*   **Frontend:** React.js o Vue.js (per la gestione reattiva della griglia e dei timer).
*   **Backend/Realtime:** Node.js con Socket.io (per il passaggio delle buste in tempo reale) OPPURE Supabase (PostgreSQL + Realtime).
*   **Styling:** Tailwind CSS per uno sviluppo rapido dell'UI responsiva.
