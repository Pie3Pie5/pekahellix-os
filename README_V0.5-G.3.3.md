# Pekahellix OS — V0.5-G.3.3

Version corrective de G.3.2.

## Déploiement

1. Remplacer les fichiers du site par ceux de ce package.
2. **Conserver le `config.js` de production** si vous utilisez déjà celui configuré avec Supabase.
3. Déployer sur GitHub Pages.
4. Recharger avec Ctrl+F5.
5. Vérifier dans la console : `window.PEKAHELLIX_BUILD` doit renvoyer `0.5-G.3.3`.

## Test attendu

Pour un utilisateur avec :
- `access_communication = true`
- `access_communication_report = true`
- `organization_id` renseigné

la console `osUser` doit contenir :
- `organizationId: "..."`
- `communicationReport: true`

et le bouton **« 📊 Résultats de mon équipe »** doit être visible dans Communication.

Aucune migration SQL supplémentaire n’est nécessaire.
