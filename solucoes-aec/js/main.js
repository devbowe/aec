// Executa ao carregar conteúdo da página
$(document).ready(() => {
    // Adiciona mascara ao telefone
    var SPMaskBehavior = function (val) {
            return val.replace(/\D/g, "").length === 11
                ? "(00) 00000-0000"
                : "(00) 0000-00009";
        },
        spOptions = {
            onKeyPress: function (val, e, field, options) {
                field.mask(SPMaskBehavior.apply({}, arguments), options);
            },
        };
    $("input[type='tel']").mask(SPMaskBehavior, spOptions);

    //Insere campos de UTM's e URL_Pagina automaticamente
    const params = new URLSearchParams(window.location.search);
    $("form").append(
        $(
            `<input type="hidden" name="utm_medium" value="${params.get(
                "utm_medium"
            )}" />`
        )
    );
    $("form").append(
        $(
            `<input type="hidden" name="utm_source" value="${params.get(
                "utm_source"
            )}" />`
        )
    );
    $("form").append(
        $(
            `<input type="hidden" name="utm_campaign" value="${params.get(
                "utm_campaign"
            )}" />`
        )
    );
    $("form").append(
        $(
            `<input type="hidden" name="utm_term" value="${params.get(
                "utm_term"
            )}" />`
        )
    );
    $("form").append(
        $(
            `<input type="hidden" name="utm_content" value="${params.get(
                "utm_content"
            )}" />`
        )
    );
    $("form").append(
        $(`<input type="hidden" name="url_pagina" value="${location.protocol + "//" + location.host + location.pathname}" />`)
    );
});

//Ação quando submita o formulário
$("#submit-button").on("click", function () {
    let formContainer = $(this).closest("form");
    let inputFields = $(formContainer).find("input");
    let selectFields = $(formContainer).find("select");

    if (validateEmptyFields(inputFields, selectFields)) {
        convertLeadRDStation(inputFields, selectFields);
    }
});

function convertLeadRDStation(inputs, selects = null) {
    const dataLead = [];
    inputs.each((key, item) => {
        var valueField;
        // Se for Accept Legal convert o value para sim ou nao
        if ($(item).attr("type") === "checkbox" && $(item).val() === "on") {
            valueField = $(item).is(":checked") ? "Sim" : "Não";
        } else {
            valueField = $(item).val();
        }
        dataLead.push({ name: $(item).attr("name"), value: valueField });
    });

    selects.each((key, item) => {
        const valueField = $(item).val();
        dataLead.push({ name: $(item).attr("name"), value: valueField });
    });

    dataLead.push(
        { name: "token_rdstation", value: "6d7b756283fe41f029baea0f98956ca4" },
        {
            name: "identificador",
            value: "solucoes-aec",
        },
        {
            name: "Mensagem",
            value: document.querySelector("textarea[name='cf_mensagem']").value,
        },
        {
            name: "Site",
            value: document.querySelector("textarea[name='site']").value,
        },
        {
            name: "from_url",
            value: location.href
        }
    );

    console.log(dataLead);
    RdIntegration.post(dataLead);

    $("input").val("");
    // $("select").val("");

    setTimeout(() => {
        window.location.href = "https://www.aec.com.br/solucoes-aec-obrigado/";
    }, 1000);
}

// Força digitar apenas letras no campo nome
$("input[name=name]").keyup(function () {
    this.value = this.value.replace(
        /[^A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]/g,
        ""
    );
});

// Validação no formato de e-mail
function validacaoEmail(email) {
    var verifica =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return verifica.test(String(email).toLowerCase());
}

// Validação de e-mail corporativo
var invalidDomains = [
    "@gmail.",
    "@yahoo.",
    "@hotmail.",
    "@live.",
    "@aol.",
    "@outlook.",
    "@bol.",
    "@uol.",
    "@icloud.",
    "@ig.",
];

function emailCorporativo(email) {
    const emailNormalized = String(email).toLowerCase();
    for (var i = 0; i < invalidDomains.length; i++) {
        var domain = invalidDomains[i];
        if (emailNormalized.indexOf(domain) != -1) {
            return false;
        }
    }
    return true;
}

// Faz a validação dos campos vazios
function validateEmptyFields(inputs, selects = null) {
    // Reseta as mensagens
    let spanFields = $("form").find("span");
    spanFields.remove();

    // Adiciona mensagens de erros, aos campos do tipo select
    selects.each((key, item) => {
        const valueField = $(item);
        console.log(item);
        if (
            valueField.val() == "nulo" ||
            valueField.val() === "nulo" ||
            valueField.val() === ""
        ) {
            $(item).after("<span class='error'>Selecione uma opção.</span>");
        }
    });

    // Adiciona mensagens de erros, aos campos do tipo input
    inputs.each((key, item) => {
        var valueField = $(item);

        // Verificação no input do tipo checkbox
        if (
            valueField.attr("type") === "checkbox" &&
            valueField.is(":checked") === false
        ) {
            $(valueField)
                .closest("label")
                .after(
                    "<span class='error-accept-legal'>É necessário aceitar os termos.</span>"
                );
        } else if (
            valueField.attr("type") === "tel" &&
            $(valueField).val().length > 0 &&
            $(valueField).val().length <= 13
        ) {
            $(valueField).after(
                "<span class='error'>Número de telefone incompleto ou no formato incorreto.</span>"
            );
        } else if (valueField.attr("name") === "email") {
            if (valueField.val().length === 0) {
                valueField.after(
                    "<span class='error'>O campo não pode ser vazio.</span>"
                );
            }

            if (
                valueField.val().length > 3 &&
                !validacaoEmail(valueField.val())
            ) {
                $(valueField).after(
                    "<span class='error'>Formato de e-mail inválido.</span>"
                );
            }

            // Só valida e-mail corporativo se a empresa tiver mais de 100 colaboradores
            let qtdFuncionarios = $("select[name=funcionarios]");
            let maisDeCem =
                $(qtdFuncionarios).val() !== "até 10" &&
                $(qtdFuncionarios).val() !== "11 - 100";

            if (maisDeCem && !emailCorporativo(valueField.val())) {
                $(valueField).after(
                    "<span class='error'>Utilize um e-mail corporativo.</span>"
                );
            }
        } else if (
            valueField.val().length === 0 &&
            !valueField.hasClass("not-required")
        ) {
            valueField.after(
                "<span class='error'>O campo não pode ser vazio.</span>"
            );
        }
    });

    // Verifica se os inputs não estão vazios
    inputEmptyFields = inputs.filter((key, el) => {
        return $(el).val().length === 0 && !$(el).hasClass("not-required");
    });

    // Verifica se os selects foram selecionados
    selectEmptyFields = selects.filter((key, el) => {
        return $(el).val() == "nulo";
    });

    // Retorna o resultado da validação
    let qtdFuncionarios = $("select[name=funcionarios]");
    let maisDeCem =
        $(qtdFuncionarios).val() !== "até 10" &&
        $(qtdFuncionarios).val() !== "11 - 100";
    if (
        inputEmptyFields.length !== 0 ||
        selectEmptyFields.length !== 0 ||
        !validacaoEmail($("input[type=email]").val()) ||
        (maisDeCem && !emailCorporativo($("input[type=email]").val())) ||
        !$("input[type=checkbox]").is(":checked")
    ) {
        return false;
    } else {
        return true;
    }
}

//Adiciona o campo de descrever o que o cliente busca na AeC
$("select[name='Assunto']").change(function (e) {
    let el = e.target.value;
    let campoDescricaoMotivo = $("input[name=motivo_assunto]");

    el === "Outros" ? campoDescricaoMotivo.show() : campoDescricaoMotivo.hide();
});

// Ao clicar ele rola a página até o ID definido
function scrollToForm(target = "#first") {
    document.querySelector(target).scrollIntoView({
        behavior: "smooth",
    });
}

$("input[name='nome']").keyup(function () {
    this.value = this.value.replace(
        /[^A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]/g,
        ""
    );
});

// Abre o modal
function openModal() {
    $("#section-1 .col-two .box.form-modal").addClass("show");
}

// Fecha o modal
function closeModal() {
    $("#section-1 .col-two .box.form-modal").removeClass("show");
}

console.log(
    {
        name: "Mensagem",
        value: document.querySelector("textarea[name='cf_mensagem']").value,
    },
    {
        name: "Site",
        value: document.querySelector("textarea[name='site']").value,
    }
);
