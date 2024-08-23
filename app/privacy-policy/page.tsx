import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PrivacyPolicy() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");
  return (
    <div>
      <h1>Politique de Confidentialité de Projet-Genesis</h1>
      <div>
        <h2>1. Introduction</h2>
        <p>
          Cette Politique de Confidentialité explique comment Projet-Gensis
          (ci-après &lduoquotes;l&apos;application&rduoquotes;) collecte,
          utilise, et protège les informations personnelles de ses utilisateurs.
          En utilisant notre application, vous acceptez les pratiques décrites
          dans cette politique.
        </p>
      </div>
      <div>
        <h2>2. Informations Collectées</h2>
        <p>
          L&apos;application utilise exclusivement l&apos;authentification via
          OAuth pour permettre aux utilisateurs de se connecter. OAuth est un
          protocole standardisé qui permet l&apos;autorisation sécurisée dans un
          environnement simplifié. En utilisant OAuth, l&apos;application ne
          stocke pas directement vos identifiants (comme les mots de passe) mais
          reçoit un jeton d&apos;accès permettant de vérifier votre identité
          auprès du fournisseur de service OAuth (comme Google, Facebook, etc.).
        </p>
        <p>
          Lors de l&apos;authentification via OAuth, nous collectons et
          utilisons uniquement les informations nécessaires à la création et à
          la gestion de votre compte utilisateur sur notre application. Cela
          inclut :
        </p>
        <ul>
          <li>Nom et prénom (le cas échéant)</li>
          <li>Adresse email</li>
          <li>Photo de profil (facultatif, selon le fournisseur OAuth)</li>
          <li>ID utilisateur fourni par le service OAuth</li>
        </ul>
      </div>
      <div>
        <h2>3. Sécurité des Données</h2>
        <p>
          Nous prenons la sécurité de vos données très au sérieux et mettons en
          œuvre des mesures de sécurité techniques et organisationnelles
          appropriées pour protéger vos informations contre l&apos;accès non
          autorisé, la modification, la divulgation ou la destruction.
        </p>
        <p>
          Toutes les communications entre l&apos;application et les serveurs
          sont chiffrées via des protocoles de sécurité standard tels que
          SSL/TLS. Les informations sensibles, comme les jetons d&apos;accès
          OAuth, sont également protégées par des méthodes de chiffrement
          avancées.
        </p>
      </div>
      <div>
        <h2>4. Modifications de la politique de confidentialité</h2>
        <p>
          Nous nous réservons le droit de modifier cette Politique de
          Confidentialité à tout moment. En cas de modification substantielle,
          nous vous en informerons par le biais de l&apos;application ou par un
          autre moyen approprié. Nous vous encourageons à consulter
          régulièrement cette politique pour rester informé des mises à jour.
        </p>
      </div>
    </div>
  );
}
