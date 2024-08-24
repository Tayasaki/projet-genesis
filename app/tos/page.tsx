import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TOS() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">
        Conditions générales d&apos;utilisation de Projet-Genesis
      </h1>
      <div>
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>
          Bienvenue sur Projet-Genesis, une application dédiée aux passionnés de
          jeux de rôle (JDR). Cette application vous permet de créer des
          scénarios et des personnages de manière manuelle ou semi-automatique.
          Elle offre également des fonctionnalités complémentaires, telles que
          la création d&apos;armes. Ces Conditions Générales d&apos;Utilisation
          (CGU) régissent l&apos;utilisation de l&apos;application. En utilisant
          cette application, vous acceptez ces CGU.
        </p>
      </div>
      <div>
        <h2 className="text-xl font-semibold">2. Acceptation des conditions</h2>
        <p>
          En accédant ou en utilisant Projet-Genesis, vous acceptez d&apos;être
          lié par les présentes CGU. Si vous n&apos;acceptez pas ces conditions,
          vous ne devez pas utiliser l&apos;application. Nous vous encourageons
          à lire ces conditions attentivement avant d&apos;utiliser notre
          service.
        </p>
      </div>
      <div>
        <h2 className="text-xl font-semibold">
          3. Accès et utilisation de l&apos;application
        </h2>
        <p>
          L&apos;application est destinée à toute personne âgée de 13 ans ou
          plus. Si vous avez moins de 13 ans, vous devez obtenir la permission
          d&apos;un parent ou d&apos;un tuteur pour utiliser cette application.
          Vous êtes responsable de toute l&apos;activité qui se déroule sous
          votre compte et vous devez vous assurer que toutes les informations
          que vous fournissez lors de l&apos;inscription sont exactes et
          complètes.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">4. Comptes utilisateurs</h2>
        <p>
          Pour accéder à l&apos;application, vous devez créer un compte
          utilisateur. Vous acceptez de fournir des informations précises et de
          les mettre à jour en cas de modification. Vous êtes responsable de la
          sécurité de votre compte et des actions effectuées via celui-ci.
        </p>
        <p>
          En cas d&apos;activité suspecte sur votre compte, vous devez nous en
          informer immédiatement. Nous nous réservons le droit de suspendre ou
          de supprimer des comptes sans préavis en cas de violation de ces CGU.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">5. Propriété intellectuelle</h2>
        <p>
          Tous les contenus disponibles sur l&apos;application, y compris les
          textes, images, graphiques, logos, interfaces utilisateur, et le code
          source, sont protégés par des droits d&apos;auteur et d&apos;autres
          lois sur la propriété intellectuelle. L&apos;application et son
          contenu sont la propriété exclusive de l&apos;équipe de développement.
        </p>
        <p>
          Vous avez le droit d&apos;utiliser l&apos;application et son contenu
          uniquement dans le cadre de l&apos;utilisation personnelle et non
          commerciale de l&apos;application. Toute reproduction, distribution,
          modification, ou autre utilisation du contenu sans autorisation
          préalable est strictement interdite.
        </p>
      </div>
      <div>
        <h2 className="text-xl font-semibold">
          6. Modification des conditions
        </h2>
        <p>
          Nous nous réservons le droit de modifier ces CGU à tout moment. Si
          nous apportons des modifications importantes, nous vous en informerons
          via l&apos;application ou par tout autre moyen approprié. Votre
          utilisation continue de l&apos;application après l&apos;entrée en
          vigueur des modifications constitue votre acceptation de ces
          modifications. Nous vous recommandons de consulter régulièrement ces
          CGU pour rester informé de toute mise à jour.
        </p>
      </div>
    </div>
  );
}
