using MongoDB.Bson;
using MongoDB.Driver;

namespace EcoRide.Backend.Services;

public class PreferenceService : IPreferenceService
{
    private readonly IMongoCollection<BsonDocument> _preferencesCollection;

    public PreferenceService(IMongoDatabase mongoDatabase, IConfiguration configuration)
    {
        var collectionName = configuration["MongoDbSettings:PreferencesCollectionName"];
        _preferencesCollection = mongoDatabase.GetCollection<BsonDocument>(collectionName!);
    }

    public async Task<BsonDocument?> GetPreferencesAsync(int utilisateurId)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", utilisateurId);
        return await _preferencesCollection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task CreateOrUpdatePreferencesAsync(int utilisateurId, Dictionary<string, object> preferences)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", utilisateurId);
        var existing = await _preferencesCollection.Find(filter).FirstOrDefaultAsync();

        var document = new BsonDocument
        {
            { "utilisateur_id", utilisateurId },
            { "fumeur", preferences.ContainsKey("fumeur") ? preferences["fumeur"] : false },
            { "animaux", preferences.ContainsKey("animaux") ? preferences["animaux"] : false }
        };

        // Ajouter les préférences personnalisées
        if (preferences.ContainsKey("preferences_personnalisees"))
        {
            var customPrefs = preferences["preferences_personnalisees"] as List<string> ?? new List<string>();
            document.Add("preferences_personnalisees", new BsonArray(customPrefs));
        }

        document.Add("date_modification", DateTime.UtcNow);

        if (existing != null)
        {
            await _preferencesCollection.ReplaceOneAsync(filter, document);
        }
        else
        {
            await _preferencesCollection.InsertOneAsync(document);
        }
    }

    public async Task DeletePreferencesAsync(int utilisateurId)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", utilisateurId);
        await _preferencesCollection.DeleteOneAsync(filter);
    }
}
