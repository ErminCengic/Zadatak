Zadatak sam testirao u Firefox Web Browser-u.

File-ovi resourcePlaner.html i style.css se koriste samo za početni prikaz aplikacije, sav ostali prikaz rađen je putem Javascript. Za manipulaciju stabla dokumenta koristio sam Document Object Model (Javascript interface).
Ubacio sam testne podatke za timove, radnike i projekte.
Nakon pokretanja aplikacije otvori se database (indexedDb) i kreiraju se store-ovi (ukoliko je prvi put pokrenuta aplikacija).
Na početku se bira ime tima/timova i godina. Nakon klika na Show prikazuje se tabela (godišnji izvještaj) za odabrane timove i godinu. Klikom na neku od ćelija otvara se popup gdje se prikazuje nova tabela (mjesečni izvještaj) gdje se svaka ćelija može editovati. Ako je prvi put pokrenuta aplikacija polja 'available' su setovana na "-", tj. mogu se editovati ukoliko je potrebno. Nakon što se edituju polja 'available' (prihvata samo pozitivne brojeve i ne veće od 5), mogu se editovati i ostala polja. Nakon editovanja i klikom na Save ažuriraju se podaci u bazi, te se tabela za gidišnji izvještaj ažurira na osnovu editovanih podataka. 
