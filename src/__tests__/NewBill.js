/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills";
import { ROUTES } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router";
import { localStorageMock } from "../__mocks__/localStorage.js";

/**Suite de tests pour soumettre un formulaire sur la page NewBill :

La suite de tests vérifie si la fonction de soumission est appelée correctement et si la page Bills est rendue après avoir soumis le formulaire avec des données complètes.
Elle configure un utilisateur fictif en tant qu'employé, crée une instance de NewBill, et simule le remplissage du formulaire avec des données valides.
Ensuite, elle déclenche la soumission du formulaire et vérifie si la fonction handleSubmit est appelée et si la page Bills est affichée. */

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I click on Submit button with a complete form", () => {
      test("Then It should call the submit function and renders Bills page", async () => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: bills });
        };
        const currentNewBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorage,
        });
        const fileTest = new File(["facture"], "trajet.png", {
          type: "image/png",
        });
        const handleChangeFile = jest.fn((e) =>
          currentNewBill.handleChangeFile(e)
        );
        const selectFile = screen.getByTestId("file");
        selectFile.addEventListener("change", handleChangeFile);
        userEvent.upload(selectFile, fileTest);
        screen.getByTestId("expense-type").value = "Transports";
        screen.getByTestId("expense-name").value = "toulouse - paris";
        screen.getByTestId("datepicker").value = "2022-06-15";
        screen.getByTestId("amount").value = "200";
        screen.getByTestId("vat").value = "2";
        screen.getByTestId("pct").value = "20";
        screen.getByTestId("commentary").value = "aller retour";
        const handleSubmit = jest.spyOn(currentNewBill, "handleSubmit");
        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(handleSubmit).toHaveBeenCalled();
        await waitFor(() => screen.getByText("Mes notes de frais"));
        const billsPage = screen.getByText("Mes notes de frais");
        expect(billsPage).toBeTruthy();
      });
    });
  });
});

/**Suite de tests pour les tests d'intégration avec des requêtes API POST :

La suite de tests vérifie la requête POST pour créer une nouvelle note de frais dans l'application.
Elle vérifie si l'appel API est effectué correctement et si le type de note de frais retourné correspond à la valeur attendue ("Hôtel et logement").
De plus, elle comprend deux cas de test pour la gestion des erreurs lorsque l'API retourne les codes d'état 404 ou 500. Elle vérifie si les messages d'erreur sont correctement affichés sur la page Bills. */

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to newBill", () => {
    describe("When I POST a new bill", () => {
      test("Then it should be a new bill from mock API POST", async () => {
        const getSpy = jest.spyOn(mockStore, "bills");
        const bill = await mockStore.bills().update();

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(bill.type).toBe("Hôtel et logement");
      });
    });
    //test erreur 404 et 500
    describe("When an error occurs on API", () => {
      beforeEach(() => {
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
      test("POST bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            upload: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("POST messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            upload: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
