/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
//important pour les test 404 et 500
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true); //test si windowIcon a la classe active-icon
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

// Test d'intégration GET

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("Then the Bills are show", async () => {
      /**Ce test vérifie que la page des notes de frais ("Bills") est correctement affichée lorsque l'utilisateur navigue vers cette page.
      Le test effectue les actions suivantes :
      Définit un utilisateur connecté en tant qu'employé dans le localStorage.
      Crée un élément div dans le DOM pour servir de point d'ancrage à l'application.
      Active le routage pour simuler la navigation vers la page "Bills".
      Attend que le texte "Mes notes de frais" soit affiché dans la page.
      Vérifie que le texte "Mes notes de frais" est bien présent dans la page. */
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
    test("Then the newBills button is show", async () => {
      /**Ce test vérifie que le bouton "Nouvelle note de frais" est correctement affiché lorsque l'utilisateur navigue vers la page des notes de frais ("Bills").
    Le test effectue les actions suivantes :
    Définit un utilisateur connecté en tant qu'employé dans le localStorage.
    Crée un élément div dans le DOM pour servir de point d'ancrage à l'application.
    Active le routage pour simuler la navigation vers la page "Bills".
    Crée une instance de la classe Bills pour gérer les interactions sur la page Bills.
    Attend que le bouton avec le testid "btn-new-bill" soit affiché dans la page.
    Vérifie que le bouton "Nouvelle note de frais" est bien présent dans la page.
    Ajoute un écouteur d'événement pour le clic sur le bouton "Nouvelle note de frais".
    Simule un clic sur le bouton.
    Vérifie que la fonction handleClickNewBill a été appelée lorsque le bouton est cliqué. */
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      const billContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });
      window.onNavigate(ROUTES_PATH.Bills);
      const button = screen.getByTestId("btn-new-bill");
      expect(button).toBeTruthy();
      const handleClickNewBill = jest.fn(billContainer.handleClickNewBill);
      button.addEventListener("click", handleClickNewBill);
      fireEvent.click(button);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
  //test modal
  /**Ce test vérifie qu'une modal (fenêtre modale) s'ouvre lorsque l'utilisateur clique sur l'icône de l'œil dans le tableau de bord ("Dashboard").
Le test effectue les actions suivantes :
Définit une fonction onNavigate pour simuler la navigation vers une autre page.
Définit un utilisateur connecté en tant qu'employé dans le localStorage.
Crée une instance de la classe Bills pour gérer les interactions sur la page des notes de frais ("Bills").
Crée une représentation HTML de la page des notes de frais ("Bills") en utilisant BillsUI et l'ajoute au corps du document.
Mocke la fonction $.fn.modal pour simuler l'ouverture de la modal.
Crée une fonction handleClickIconEye qui sera appelée lorsque l'utilisateur clique sur l'icône de l'œil.
Sélectionne l'icône de l'œil dans la page et ajoute un écouteur d'événement pour le clic sur cet icône.
Simule un clic sur l'icône de l'œil.
Vérifie que la fonction handleClickIconEye a été appelée lorsque l'icône de l'œil est cliquée.
Vérifie que le texte "Justificatif" est bien présent dans la page, ce qui indique que la modal a été ouverte. */
  describe("When on the Dashboard and I click on eye icon", () => {
    test("Then a modal should be open", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const billContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn((e) =>
        billContainer.handleClickIconEye(e.target)
      );

      const eyeIcon = screen.getAllByTestId("icon-eye")[0];
      expect(eyeIcon).toBeTruthy();
      eyeIcon.addEventListener("click", handleClickIconEye);
      fireEvent.click(eyeIcon);

      expect(handleClickIconEye).toHaveBeenCalled();
      expect(screen.getAllByText("Justificatif")).toBeTruthy();
    });
  });
  //erreur 404
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      /**Cette fonction est exécutée avant chaque test dans la suite de tests. Elle initialise l'environnement pour chaque test.
    Dans ce cas :
    Elle utilise jest.spyOn pour *espionner* la méthode bills du mockStore.
    Elle définit un utilisateur connecté en tant qu'employé dans le localStorage.
    Elle crée un élément <div> avec l'ID "root" et l'ajoute au corps du document. Cet élément est utilisé pour rendre les composants React dans les tests.
    Elle appelle la fonction router() pour simuler la navigation vers une page spécifique. */
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      /**Ce test vérifie que lorsque les notes de frais sont récupérées depuis l'API et qu'une erreur 404 se produit, un message d'erreur "Erreur 404" est affiché à l'écran.
    Le test effectue les actions suivantes :
    Mocke la fonction list de bills du mockStore pour renvoyer une promesse rejetée avec une erreur "Erreur 404".
    Simule la navigation vers la page des notes de frais ("Bills") en appelant window.onNavigate(ROUTES_PATH.Bills).
    Attend que le rendu des composants soit effectué en utilisant await new Promise(process.nextTick).
    Sélectionne tous les éléments de la page qui contiennent le texte "Erreur 404" en utilisant screen.getAllByText(/Erreur 404/).
    Vérifie que le message d'erreur "Erreur 404" est bien présent à l'écran. */
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getAllByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    //erreur 500
    test("fetches messages from an API and fails with 500 message error", async () => {
      /**Ce test vérifie que lorsque des messages sont récupérés depuis l'API et qu'une erreur 500 se produit, un message d'erreur "Erreur 500" est affiché à l'écran.
    Le test effectue les actions suivantes :
    Mocke la fonction list de bills du mockStore pour renvoyer une promesse rejetée avec une erreur "Erreur 500".
    Simule la navigation vers la page des notes de frais ("Bills") en appelant window.onNavigate(ROUTES_PATH.Bills).
    Attend que le rendu des composants soit effectué en utilisant await new Promise(process.nextTick).
    Sélectionne tous les éléments de la page qui contiennent le texte "Erreur 500" en utilisant screen.getAllByText(/Erreur 500/).
    Vérifie que le message d'erreur "Erreur 500" est bien présent à l'écran. */
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getAllByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
