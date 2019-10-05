from flask import Flask, request, jsonify
from textblob import TextBlob, Word

app = Flask(__name__)



@app.route('/createFIB',methods = ['POST'])
def createFIB():
    content = request.get_json()
    content = content['para']
    blob = TextBlob(content)
    s = set()
    for item in blob.noun_phrases:
        s.add(item)
    answers = blob.noun_phrases
    print(answers)
    question = content.lower()
    for i in answers:
        answer_length = len(i)
        print(answer_length)
        question = question.replace(i,fill(answer_length))
        print(question)

    return jsonify(
        correctAnswers = answers,
        fillspace = question
    )


@app.route('/createShortSummery',methods =['POST'])
def createSummery():
    content = request.get_json()
    para = content['para']
    blob = TextBlob(para)
    nouns = list()
    for word, tag in blob.tags:
        if tag == 'NN':
            nouns.append(word.lemmatize())

    print("This text is about...",nouns)
    summery =[]
    for item in nouns:
        word = Word(item)
        summery.append(word.pluralize())


    return jsonify(
        shortsummery =summery
    )


@app.route('/tags',methods = ['POST'])
def createTags():
    content = request.get_json()
    text = content['para']
    blob = TextBlob(text)
    nouns = list()
    s = set()
    for word, tag in blob.tags:
        if tag == 'NNP':
            s.add("#"+word)
    return jsonify(
        tags = convert(s)
    )


@app.route('/textCheck',methods =['POST'])
def textCheck():
    content = request.get_json()
    para = content['para']
    blob = TextBlob(para)
    data = []

    for word in blob.words:
        item = {}
        correct_text  = word.correct()
        if(correct_text != word):
            item['correct'] = correct_text
            item['word'] = word;
            data.append(item)
    return jsonify(
        correct =data,
        old = para
    )

@app.route('/createFIB/<type>',methods = ['POST'])
def createFIBviatype(type):
    if type == 'sentence':
        content = request.get_json()
        content = content['para']
        blob = TextBlob(content)
        s = set()
        data = []
        for sentence in blob.sentences:
            print(sentence)
            sentence_content =  sentence.string
            sentences_obj = {}
            sentences_obj['question'] = sentence_content
            data.append(sentences_obj)

            blobin = TextBlob(sentence.string)

            for item in blobin.noun_phrases:
                s.add(item)
            answers = blobin.noun_phrases
            sentences_obj['answers'] = answers
            question = sentence_content.lower()
            for i in answers:
                answer_length = len(i)
                print(answer_length)
                question = question.replace(i, fill(answer_length))
                print(question)
                sentences_obj['fib-question'] = question

    return jsonify(
        fibs=data
    )

def convert(set):
    return [*set, ]

def fill(length):
    space = ""
    for i in range(length):
        space = space + "_"
    return space

if __name__ == '__main__':
    app.run(debug=True)